import { connectDB } from '@/server/utils/mongoose'
import { Reservation } from '@/server/models/Reservation'
import { ReservationSeat } from '@/server/models/ReservationSeat'
import { OrderItem } from '@/server/models/OrderItem'
import { MenuItem } from '@/server/models/MenuItem'
import { Recipe } from '@/server/models/Recipe'
import { Ingredient } from '@/server/models/Ingredient'

export default defineEventHandler(async (event) => {
    await connectDB()

    // En productivo, valida firma/secret del proveedor (cabecera)
    const b = await readBody<{ reservationId: string }>(event)
    if (!b?.reservationId) throw createError({ statusCode: 400, statusMessage: 'reservationId requerido' })

    const res = await Reservation.findById(b.reservationId)
    if (!res) throw createError({ statusCode: 404, statusMessage: 'Reserva no encontrada' })

    if (res.status === 'paid') return { ok: true, alreadyPaid: true } // idempotente
    if (res.status !== 'pending') throw createError({ statusCode: 409, statusMessage: `Estado inválido: ${res.status}` })
    if (res.expiresAt && res.expiresAt.getTime() < Date.now()) {
        // expiró el hold
        res.status = 'expired'
        await res.save()
        // limpiar seats
        await ReservationSeat.deleteMany({ reservationId: res._id })
        throw createError({ statusCode: 409, statusMessage: 'Reserva expirada' })
    }

    // Descontar inventario según snapshot de carrito (si la receta existe)
    // 1) agrupar consumo por ingrediente (unidad base)
    const consumeByIngredient = new Map<string, number>()
    if (res.cart?.length) {
        const ids = [...new Set(res.cart.map(i => String(i.menuItemId)))]
        const menuDocs = await MenuItem.find({ _id: { $in: ids }, activo: true }).lean()
        const menuMap = new Map(menuDocs.map(m => [String(m._id), m]))

        const recipeIds = [...new Set(menuDocs.map(m => m.recipeId).filter(Boolean).map(String))]
        const recipes = recipeIds.length ? await Recipe.find({ _id: { $in: recipeIds } }).lean() : []
        const recipeMap = new Map(recipes.map(r => [String(r._id), r]))

        for (const ci of res.cart) {
            const md = menuMap.get(String(ci.menuItemId))
            if (md?.recipeId) {
                const rec = recipeMap.get(String(md.recipeId))
                if (rec?.items?.length) {
                    for (const ri of rec.items as any[]) {
                        const add = Number(ri.qtyBase) * ci.qty
                        const k = String(ri.ingredientId)
                        consumeByIngredient.set(k, (consumeByIngredient.get(k) || 0) + add)
                    }
                }
            }
        }

        // 2) validar stock suficiente
        if (consumeByIngredient.size) {
            const ingIds = [...consumeByIngredient.keys()]
            const ings = await Ingredient.find({ _id: { $in: ingIds } }).select('stockBase nombre').lean()
            const stockMap = new Map(ings.map(x => [String(x._id), x.stockBase || 0]))
            for (const [ingId, need] of consumeByIngredient.entries()) {
                const have = stockMap.get(ingId) ?? 0
                if (have < need) {
                    throw createError({ statusCode: 409, statusMessage: `Stock insuficiente de ingrediente` })
                }
            }
        }
    }

    // 3) crear OrderItems desde snapshot y descontar inventario
    if (res.cart?.length) {
        await OrderItem.insertMany(
            res.cart.map(ci => ({
                reservationId: res._id,
                menuItemId: ci.menuItemId,
                nombre: ci.nombre,
                qty: ci.qty,
                price: ci.unitPrice
            }))
        )
    }
    // OUT inventario
    // (en futuro: persiste movimientos OUT con historial)
    // @ts-ignore
    if (res.cart?.length) {
        const idsSet = new Set<string>()
        const updates: any[] = []
        // Recalcular el mismo consumo que arriba para no duplicar lógica:
        // (Podrías factorizar en util si prefieres.)
        // Para simplicidad y evitar segunda query, lo repetimos:
        // (si optimizar, mueve a una función.)

        // Volvemos a calcular consumo:
        const ids = [...new Set(res.cart.map(i => String(i.menuItemId)))]
        const menuDocs = await MenuItem.find({ _id: { $in: ids }, activo: true }).lean()
        const menuMap = new Map(menuDocs.map(m => [String(m._id), m]))
        const recipeIds = [...new Set(menuDocs.map(m => m.recipeId).filter(Boolean).map(String))]
        const recipes = recipeIds.length ? await Recipe.find({ _id: { $in: recipeIds } }).lean() : []
        const recipeMap = new Map(recipes.map(r => [String(r._id), r]))

        const consumeMap = new Map<string, number>()
        for (const ci of res.cart) {
            const md = menuMap.get(String(ci.menuItemId))
            if (!md?.recipeId) continue
            const rec = recipeMap.get(String(md.recipeId))
            if (!rec?.items?.length) continue
            for (const ri of rec.items as any[]) {
                const add = Number(ri.qtyBase) * ci.qty
                const k = String(ri.ingredientId)
                consumeMap.set(k, (consumeMap.get(k) || 0) + add)
            }
        }
        for (const [ingId, need] of consumeMap.entries()) {
            updates.push(Ingredient.findByIdAndUpdate(ingId, { $inc: { stockBase: -need } }))
            idsSet.add(ingId)
        }
        if (updates.length) await Promise.all(updates)
    }

    // 4) actualizar estados
    res.status = 'paid'
    res.expiresAt = undefined
    await res.save()
    await ReservationSeat.updateMany({ reservationId: res._id }, { $set: { status: 'paid' } })

    return { ok: true }
})
