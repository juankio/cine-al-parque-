import { connectDB } from '@/server/utils/mongoose'
import { Showtime } from '@/server/models/Showtime'
import { Movie } from '@/server/models/Movie'
import pkg from 'mongoose'
const { Types } = pkg

export default defineEventHandler(async (event) => {
    await connectDB()

    const rawId = getRouterParam(event, 'id')
    if (!rawId || !Types.ObjectId.isValid(rawId)) {
        throw createError({ statusCode: 400, statusMessage: 'Showtime invǭlido' })
    }

    const showtime = await Showtime.findById(rawId).lean()
    if (!showtime || !showtime.active) {
        throw createError({ statusCode: 404, statusMessage: 'Showtime no encontrado' })
    }

    const movie = await Movie.findById(showtime.movieId)
        .select('titulo poster duracion clasificacion sinopsis')
        .lean()

    return {
        id: String(showtime._id),
        movieId: String(showtime.movieId),
        fechaHora: showtime.fechaHora,
        sala: showtime.sala || '',
        price: Number(showtime.price || 0),
        active: !!showtime.active,
        movie: movie ? {
            id: String(movie._id),
            titulo: movie.titulo,
            poster: movie.poster,
            duracion: movie.duracion,
            clasificacion: movie.clasificacion,
            sinopsis: movie.sinopsis
        } : null
    }
})
