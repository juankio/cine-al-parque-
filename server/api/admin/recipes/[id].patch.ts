import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Recipe } from '@/server/models/Recipe'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const id = getRouterParam(event, 'id')
    const b = await readBody(event)
    const update: any = {}
    if ('nombre' in b) update.nombre = String(b.nombre).trim()
    if ('items' in b && Array.isArray(b.items)) update.items = b.items.map((i: any) => ({ ingredientId: i.ingredientId, qtyBase: Number(i.qtyBase) }))
    const doc = await Recipe.findByIdAndUpdate(id, update, { new: true })
    if (!doc) throw createError({ statusCode: 404, statusMessage: 'No encontrado' })
    return { ok: true }
})
