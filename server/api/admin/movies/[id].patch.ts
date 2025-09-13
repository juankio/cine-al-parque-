import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Movie } from '@/server/models/Movie'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    const update: any = {}
    for (const k of ['titulo', 'sinopsis', 'poster', 'clasificacion']) {
        if (k in body) update[k] = body[k]
    }
    for (const k of ['duracion', 'price']) {
        if (k in body) update[k] = Number(body[k])
    }
    if ('active' in body) update.active = !!body.active

    const doc = await Movie.findByIdAndUpdate(id, update, { new: true })
    if (!doc) throw createError({ statusCode: 404, statusMessage: 'No encontrado' })
    return { ok: true }
})
