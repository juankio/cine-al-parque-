import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Movie } from '@/server/models/Movie'
import { Showtime } from '@/server/models/Showtime'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const b = await readBody<{ movieId: string, fechaHora: string, sala?: string, price?: number, active?: boolean }>(event)

    if (!b?.movieId || !b?.fechaHora) {
        throw createError({ statusCode: 400, statusMessage: 'movieId y fechaHora son requeridos' })
    }

    // valida película
    const movie = await Movie.findById(b.movieId).select('_id').lean()
    if (!movie) throw createError({ statusCode: 400, statusMessage: 'movieId inválido' })

    // parsea fecha (espera ISO con zona o UTC). Se guarda como Date (UTC)
    const when = new Date(b.fechaHora)
    if (isNaN(when.getTime())) throw createError({ statusCode: 400, statusMessage: 'fechaHora inválida (usa ISO, ej: 2025-09-12T18:30:00-05:00)' })
    if (when.getTime() < Date.now()) throw createError({ statusCode: 400, statusMessage: 'No se permiten funciones en el pasado' })

    const doc = await Showtime.create({
        movieId: b.movieId,
        fechaHora: when,
        sala: b.sala || '',
        price: Number(b.price || 0),
        active: b.active !== false
    })

    return { ok: true, showtime: { id: String(doc._id) } }
})
