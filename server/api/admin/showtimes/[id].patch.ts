import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Showtime } from '@/server/models/Showtime'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const id = getRouterParam(event, 'id')
    const b = await readBody(event)

    const update: any = {}
    if ('movieId' in b) update.movieId = b.movieId
    if ('sala' in b) update.sala = b.sala || ''
    if ('price' in b) update.price = Number(b.price || 0)
    if ('active' in b) update.active = !!b.active
    if ('fechaHora' in b) {
        const when = new Date(b.fechaHora)
        if (isNaN(when.getTime())) throw createError({ statusCode: 400, statusMessage: 'fechaHora inválida' })
        update.fechaHora = when
    }

    const doc = await Showtime.findByIdAndUpdate(id, update, { new: true })
    if (!doc) throw createError({ statusCode: 404, statusMessage: 'No encontrado' })
    return { ok: true }
})
