import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Ingredient, UNIT_MAP } from '@/server/models/Ingredient'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const b = await readBody<{ ingredientId: string, qty: number, unit: 'g' | 'kg' | 'ml' | 'l' | 'unid', totalCost: number, nota?: string }>(event)

    if (!b?.ingredientId || !b?.qty || !b?.unit || !b?.totalCost) {
        throw createError({ statusCode: 400, statusMessage: 'ingredientId, qty, unit y totalCost son requeridos' })
    }
    const qty = Number(b.qty); const totalCost = Number(b.totalCost)
    if (qty <= 0 || totalCost < 0) throw createError({ statusCode: 400, statusMessage: 'qty y totalCost inválidos' })

    const ing = await Ingredient.findById(b.ingredientId)
    if (!ing) throw createError({ statusCode: 404, statusMessage: 'Ingrediente no encontrado' })

    const def = UNIT_MAP[b.unit]
    if (!def) throw createError({ statusCode: 400, statusMessage: 'Unidad inválida' })

    // convertir qty a la base del ingrediente
    // si la compra viene en unidad distinta a la base del ingrediente, multiplicamos por factor
    const qtyBaseCompra = def.base === ing.unidadBase ? qty * def.factor : qty * def.factor // (mismo cálculo; mantenemos claro)
    const costoUnitCompra = qtyBaseCompra > 0 ? totalCost / qtyBaseCompra : 0

    // promedio ponderado
    const stockAnterior = ing.stockBase || 0
    const costoAnterior = ing.costoPromedio || 0
    const stockNuevo = stockAnterior + qtyBaseCompra
    const costoPromedioNuevo = stockNuevo > 0
        ? ((stockAnterior * costoAnterior) + totalCost) / stockNuevo
        : costoUnitCompra

    ing.stockBase = stockNuevo
    ing.costoPromedio = costoPromedioNuevo
    await ing.save()

    // (Opcional: guardar movimiento en una colección aparte si quieres llevar el historial)
    return {
        ok: true,
        ingredient: {
            id: String(ing._id),
            stockBase: ing.stockBase,
            costoPromedio: ing.costoPromedio,
            unidadBase: ing.unidadBase
        },
        compra: {
            qtyBase: qtyBaseCompra,
            costoUnit: costoUnitCompra
        }
    }
})
