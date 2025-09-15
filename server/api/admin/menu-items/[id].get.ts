import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { MenuItem } from '@/server/models/MenuItem'

export default defineEventHandler(async (event) => {
    await connectDB()
    await requireAdmin(event)

    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'Falta id' })
    }

    // Si quieres ver también la receta ligada, usa .populate('recipeId')
    const doc = await MenuItem.findById(id).lean()
    if (!doc) {
        throw createError({ statusCode: 404, statusMessage: 'No encontrado' })
    }
    return doc
})
