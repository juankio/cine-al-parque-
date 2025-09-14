import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Ingredient } from '@/server/models/Ingredient'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const b = await readBody<{ nombre: string, unidad: string, costoPromedio?: number }>(event)
    if (!b?.nombre || !b?.unidad) throw createError({ statusCode: 400, statusMessage: 'nombre y unidad son requeridos' })
    const doc = await Ingredient.create({
        nombre: b.nombre.trim(),
        unidad: b.unidad.trim(),
        costoPromedio: Number(b.costoPromedio || 0)
    })
    return { ok: true, ingredient: { id: String(doc._id) } }
})
