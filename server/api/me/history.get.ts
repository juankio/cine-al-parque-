import { connectDB } from '@/server/utils/mongoose'
import { readSession } from '@/server/utils/session'
import { Reservation } from '@/server/models/Reservation'
import pkg from 'mongoose'
const { Types } = pkg

export default defineEventHandler(async (event) => {
    await connectDB()
    const sess = await readSession(event)
    if (!sess?.id) throw createError({ statusCode: 401, statusMessage: 'No autenticado' })

    const q = getQuery(event)
    const page = Math.max(1, Number(q.page || 1))
    const pageSize = Math.min(50, Math.max(1, Number(q.pageSize || 10)))
    const skip = (page - 1) * pageSize

    const userId = new Types.ObjectId(String(sess.id))

    const [result] = await Reservation.aggregate([
        { $match: { userId } },
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                items: [
                    { $skip: skip },
                    { $limit: pageSize },
                    // showtime
                    {
                        $lookup: {
                            from: 'showtimes',
                            localField: 'showtimeId',
                            foreignField: '_id',
                            as: 'st'
                        }
                    },
                    { $unwind: '$st' },
                    // movie
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
                            id: { $toString: '$_id' },
                            createdAt: 1,
                            status: 1,
                            total: 1,
                            seats: 1,
                            showtime: {
                                id: { $toString: '$st._id' },
                                fechaHora: '$st.fechaHora',
                                sala: '$st.sala',
                                price: '$st.price'
                            },
                            movie: {
                                id: { $toString: '$mv._id' },
                                titulo: '$mv.titulo',
                                poster: '$mv.poster',
                                clasificacion: '$mv.clasificacion',
                                duracion: '$mv.duracion'
                            }
                        }
                    }
                ],
                meta: [
                    { $count: 'total' }
                ]
            }
        }
    ])

    const items = result?.items || []
    const total = (result?.meta?.[0]?.total) ?? 0

    return { items, page, pageSize, total }
})
