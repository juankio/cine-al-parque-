// server/api/admin/ingredients/[id].delete.ts
import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Ingredient } from '@/server/models/Ingredient'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const id = getRouterParam(event, 'id')

    const doc = await Ingredient.findByIdAndDelete(id)
    if (!doc) throw createError({ statusCode: 404, statusMessage: 'No encontrado' })

    return { ok: true }
})
