import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Recipe } from '@/server/models/Recipe'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const id = getRouterParam(event, 'id')
    const res = await Recipe.findByIdAndDelete(id)
    if (!res) throw createError({ statusCode: 404, statusMessage: 'No encontrado' })
    return { ok: true }
})
