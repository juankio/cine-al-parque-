import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Recipe } from '@/server/models/Recipe'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const b = await readBody<{ nombre: string, items: { ingredientId: string, qtyBase: number }[] }>(event)
    if (!b?.nombre || !Array.isArray(b.items)) throw createError({ statusCode: 400, statusMessage: 'nombre y items requeridos' })
    const doc = await Recipe.create({
        nombre: b.nombre.trim(),
        items: b.items.map(i => ({ ingredientId: i.ingredientId, qtyBase: Number(i.qtyBase) }))
    })
    return { ok: true, recipe: { id: String(doc._id) } }
})
