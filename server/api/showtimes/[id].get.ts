import { connectDB } from '@/server/utils/mongoose'
import { Showtime, type IShowtime } from '@/server/models/Showtime'
import { Movie, type IMovie } from '@/server/models/Movie'
import pkg from 'mongoose'
const { Types } = pkg

export default defineEventHandler(async (event) => {
    await connectDB()

    const rawId = getRouterParam(event, 'id')
    if (!rawId || !Types.ObjectId.isValid(rawId)) {
        throw createError({ statusCode: 400, statusMessage: 'Showtime inválido' })
    }

    const showtime = await Showtime.findById(rawId).lean<IShowtime>()
    if (!showtime || !showtime.active) {
        throw createError({ statusCode: 404, statusMessage: 'Showtime no encontrado' })
    }

    const movie = await Movie.findById(showtime.movieId)
        .select('titulo poster duracion clasificacion sinopsis')
        .lean<IMovie>()

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
