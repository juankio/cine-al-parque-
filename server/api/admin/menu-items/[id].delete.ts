import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { MenuItem } from '@/server/models/MenuItem'

export default defineEventHandler(async (event) => {
    await connectDB()
    await requireAdmin(event)

    const id = getRouterParam(event, 'id')
    const res = await MenuItem.findByIdAndDelete(id)
    if (!res) throw createError({ statusCode: 404, statusMessage: 'No encontrado' })

    return { ok: true }
})
