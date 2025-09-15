import { connectDB } from '@/server/utils/mongoose'
import { readSession } from '@/server/utils/session'
import { Showtime } from '@/server/models/Showtime'
import { Seat } from '@/server/models/Seat'
import { Reservation } from '@/server/models/Reservation'
import { ReservationSeat } from '@/server/models/ReservationSeat'
import { MenuItem } from '@/server/models/MenuItem'
import { Recipe } from '@/server/models/Recipe'
import { Ingredient } from '@/server/models/Ingredient'
import { OrderItem } from '@/server/models/OrderItem'

type CartItem = { menuItemId: string, qty: number }

export default defineEventHandler(async (event) => {
    await connectDB()
    const sess = await readSession(event)
    if (!sess) throw createError({ statusCode: 401, statusMessage: 'No autenticado' })

    const b = await readBody<{ showtimeId: string, seats: string[], items?: CartItem[] }>(event)
    if (!b?.showtimeId || !Array.isArray(b.seats) || b.seats.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'showtimeId y seats[] requeridos' })
    }

    // 1) validar showtime
    const st = await Showtime.findById(b.showtimeId).select('_id fechaHora active price').lean()
    if (!st || !st.active) throw createError({ statusCode: 400, statusMessage: 'Showtime inválido' })
    if (new Date(st.fechaHora).getTime() < Date.now()) {
        throw createError({ statusCode: 400, statusMessage: 'Función pasada' })
    }

    // 2) validar asientos existen en el layout (y que haya layout)
    const seatDocs = await Seat.find({ showtimeId: b.showtimeId }).select('tableCode seatCode').lean()
    if (!seatDocs.length) {
        throw createError({ statusCode: 409, statusMessage: 'Este showtime no tiene layout generado' })
    }
    const seatsSet = new Set(seatDocs.map(d => `${d.tableCode}-${d.seatCode}`))
    for (const key of b.seats) {
        if (!seatsSet.has(key)) {
            throw createError({ statusCode: 400, statusMessage: `Asiento inválido: ${key}` })
        }
    }

    // 3) procesar carrito de comida (opcional)
    const items = Array.isArray(b.items) ? b.items.filter(i => i && i.menuItemId && i.qty > 0) : []
    let foodTotal = 0
    let orderItemsPayload: Array<{ menuItemId: string, nombre: string, qty: number, price: number }> = []

    // Para OUT de inventario: consumo agregado por ingrediente (en unidad base)
    const consumeByIngredient = new Map<string, number>() // ingredientId -> qtyBase total

    if (items.length) {
        const ids = [...new Set(items.map(i => i.menuItemId))]
        const menuDocs = await MenuItem.find({ _id: { $in: ids }, activo: true }).lean()
        const menuMap = new Map(menuDocs.map(m => [String(m._id), m]))

        // Cargar recetas de los que tengan
        const recipeIds = [...new Set(menuDocs.map(m => m.recipeId).filter(Boolean).map(String))]
        const recipes = recipeIds.length ? await Recipe.find({ _id: { $in: recipeIds } }).lean() : []
        const recipeMap = new Map(recipes.map(r => [String(r._id), r]))

        for (const it of items) {
            const md = menuMap.get(it.menuItemId)
            if (!md) throw createError({ statusCode: 400, statusMessage: 'Menu item inválido o inactivo' })

            const unitPrice = Number((md as any).precio || 0)
            const lineTotal = unitPrice * it.qty
            foodTotal += lineTotal

            orderItemsPayload.push({
                menuItemId: String(md._id),
                nombre: md.nombre,
                qty: it.qty,
                price: unitPrice
            })

            // consumo por receta (si aplica)
            if (md.recipeId) {
                const rec = recipeMap.get(String(md.recipeId))
                if (rec?.items?.length) {
                    for (const ri of rec.items as any[]) {
                        const add = Number(ri.qtyBase) * it.qty
                        const k = String(ri.ingredientId)
                        consumeByIngredient.set(k, (consumeByIngredient.get(k) || 0) + add)
                    }
                }
            }
        }

        // validar stock suficiente antes de descontar
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

    // 4) calcular total
    const seatsTotal = (Number(st.price || 0)) * b.seats.length
    const total = seatsTotal + foodTotal

    // 5) crear reserva + bloqueos + items + OUT inventario
    try {
        const res = await Reservation.create({
            userId: sess.id,
            showtimeId: b.showtimeId,
            seats: b.seats,
            total,
            status: 'paid' // demo
        })

        // bloquear asientos (índice único se encarga del conflicto)
        await ReservationSeat.insertMany(
            b.seats.map(seatKey => ({
                showtimeId: b.showtimeId,
                seatKey,
                reservationId: res._id,
                status: 'paid'
            }))
        )

        // crear order items (si hay comida)
        if (orderItemsPayload.length) {
            await OrderItem.insertMany(
                orderItemsPayload.map(oi => ({
                    reservationId: res._id,
                    menuItemId: oi.menuItemId,
                    nombre: oi.nombre,
                    qty: oi.qty,
                    price: oi.price
                }))
            )
        }

        // descontar inventario (OUT) según consumo agregado
        if (consumeByIngredient.size) {
            const updates = []
            for (const [ingId, need] of consumeByIngredient.entries()) {
                updates.push(Ingredient.findByIdAndUpdate(ingId, { $inc: { stockBase: -need } }))
            }
            await Promise.all(updates)
            // (opcional) registrar movimientos OUT en una colección aparte
        }

        return {
            ok: true,
            reservation: { id: String(res._id), total },
            breakdown: { seatsTotal, foodTotal }
        }
    } catch (err: any) {
        if (err?.code === 11000) {
            throw createError({ statusCode: 409, statusMessage: 'Algún asiento ya fue tomado. Actualiza disponibilidad.' })
        }
        throw err
    }
})
