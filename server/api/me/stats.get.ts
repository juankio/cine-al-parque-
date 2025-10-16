import { createError } from 'h3'
import { connectDB } from '@/server/utils/mongoose'
import { readSession } from '@/server/utils/session'
import { Reservation } from '@/server/models/Reservation'
import pkg from 'mongoose'
const { Types } = pkg

export default defineEventHandler(async (event) => {
    await connectDB()

    const sess = await readSession(event)
    if (!sess?.id) {
        throw createError({ statusCode: 401, message: 'No autenticado' })
    }

    const userId = new Types.ObjectId(String(sess.id))

    // Solo reservas pagadas para métricas de visitas / gasto
    const [agg] = await Reservation.aggregate([
        { $match: { userId, status: 'paid' } },
        {
            $facet: {
                meta: [
                    {
                        $group: {
                            _id: null,
                            visits: { $sum: 1 },
                            totalSpent: { $sum: '$total' },
                            lastVisit: { $max: '$createdAt' },
                        }
                    }
                ],
                favMovie: [
                    {
                        $group: {
                            _id: '$showtimeId',
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { count: -1 } },
                    { $limit: 1 },
                    // showtime -> movie
                    {
                        $lookup: {
                            from: 'showtimes',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'st'
                        }
                    },
                    { $unwind: '$st' },
                    {
                        $lookup: {
                            from: 'movies',
                            localField: 'st.movieId',
                            foreignField: '_id',
                            as: 'mv'
                        }
                    },
                    { $unwind: '$mv' },
                    {
                        $project: {
                            _id: 0,
                            movieId: { $toString: '$mv._id' },
                            titulo: '$mv.titulo',
                            poster: '$mv.poster',
                            count: 1
                        }
                    }
                ]
            }
        }
    ])

    const meta = agg?.meta?.[0] || null
    const fav = agg?.favMovie?.[0] || null

    return {
        visits: meta?.visits ?? 0,
        totalSpent: meta?.totalSpent ?? 0,
        lastVisit: meta?.lastVisit ?? null,
        favorite: fav ?? null
    }
})
