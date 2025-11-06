import { defineEventHandler, getQuery } from 'h3'
import { Showtime } from '~/server/models/Showtime'
import { Movie } from '~/server/models/Movie'
import { Types } from 'mongoose'

export default defineEventHandler(async (event) => {
    const q = getQuery(event)

    // parámetros opcionales
    const upcoming = q.upcoming ? true : false
    const hours = Number(q.hours ?? 24)          // rango por defecto: 24 horas
    const limit = Math.min(Number(q.limit ?? 12), 50)

    // filtro por movieId (si viene)
    const movieId = q.movieId && Types.ObjectId.isValid(String(q.movieId))
        ? new Types.ObjectId(String(q.movieId))
        : null

    const now = new Date()

    // rango de tiempo
    let timeFilter: any = {}
    if (upcoming) {
        const to = new Date(now.getTime() + hours * 60 * 60 * 1000)
        timeFilter = { $gte: now, $lte: to }
    } else {
        timeFilter = { $gte: now }
    }

    const match: any = {
        active: true,
        fechaHora: timeFilter
    }
    if (movieId) match.movieId = movieId

    // unir con películas
    const data = await Showtime.aggregate([
        { $match: match },
        { $sort: { fechaHora: 1 } },
        { $limit: limit },
        {
            $lookup: {
                from: Movie.collection.name,
                localField: 'movieId',
                foreignField: '_id',
                as: 'movie'
            }
        },
        { $unwind: '$movie' },
        {
            $project: {
                _id: 1,
                movieId: 1,
                sala: 1,
                price: 1,
                fechaHora: 1,
                titulo: '$movie.titulo',
                poster: '$movie.poster'
            }
        }
    ])

    return {
        items: data.map(s => ({
            _id: s._id,
            movieId: s.movieId,
            titulo: s.titulo,
            poster: s.poster,
            sala: s.sala,
            price: s.price,
            fechaHora: s.fechaHora
        }))
    }
})
