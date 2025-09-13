import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Movie } from '@/server/models/Movie'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const id = getRouterParam(event, 'id')
    const res = await Movie.findByIdAndDelete(id)
    if (!res) throw createError({ statusCode: 404, statusMessage: 'No encontrado' })
    return { ok: true }
})
