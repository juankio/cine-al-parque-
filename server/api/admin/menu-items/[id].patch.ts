import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { MenuItem } from '@/server/models/MenuItem'

export default defineEventHandler(async (event) => {
    await connectDB()
    await requireAdmin(event)

    const id = getRouterParam(event, 'id')
    const b = await readBody(event)
    const update: any = {}

    if ('nombre' in b) update.nombre = String(b.nombre).trim()
    if ('precio' in b) update.precio = Number(b.precio)
    if ('recipeId' in b) update.recipeId = b.recipeId || null
    if ('activo' in b) update.activo = !!b.activo

    const doc = await MenuItem.findByIdAndUpdate(id, update, { new: true })
    if (!doc) throw createError({ statusCode: 404, statusMessage: 'No encontrado' })

    return { ok: true }
})
