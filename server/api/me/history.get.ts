import { createError, getQuery } from 'h3'
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

    const q = getQuery(event)
    const page = Math.max(1, Number(q.page || 1))
    const pageSize = Math.min(50, Math.max(1, Number(q.pageSize || 10)))
    const skip = (page - 1) * pageSize

    const userId = new Types.ObjectId(String(sess.id))

    // Filtros opcionales
    const status = q.status ? String(q.status) : undefined // 'pending' | 'paid' | 'expired' | 'canceled'
    const from = q.from ? new Date(String(q.from)) : null
    const to = q.to ? new Date(String(q.to)) : null
    const upcomingParam = typeof q.upcoming === 'string' ? String(q.upcoming) : undefined
    const upcoming = upcomingParam === 'true' ? true : upcomingParam === 'false' ? false : null

    const baseMatch: any = { userId }
    if (status) baseMatch.status = status
    if (from || to) {
        baseMatch.createdAt = {
            ...(from ? { $gte: from } : {}),
            ...(to ? { $lte: to } : {})
        }
    }

    const now = new Date()

    // -------- Pipeline ITEMS (con orden correcto de etapas) --------
    const itemsPipeline: any[] = [
        { $match: baseMatch },

        // join showtime
        {
            $lookup: {
                from: 'showtimes',
                localField: 'showtimeId',
                foreignField: '_id',
                as: 'st'
            }
        },
        { $unwind: '$st' },

        // filtro upcoming por fecha del showtime (si aplica)
        ...(upcoming !== null
            ? [{ $match: upcoming ? { 'st.fechaHora': { $gte: now } } : { 'st.fechaHora': { $lt: now } } }]
            : []),

        // orden
        { $sort: { createdAt: -1 } },

        // paginación
        { $skip: skip },
        { $limit: pageSize },

        // join movie
        {
            $lookup: {
                from: 'movies',
                localField: 'st.movieId',
                foreignField: '_id',
                as: 'mv'
            }
        },
        { $unwind: { path: '$mv', preserveNullAndEmptyArrays: true } },

        // proyección final EXACTA a tu shape
        {
            $project: {
                _id: 0,
                id: { $toString: '$_id' },
                createdAt: 1,
                status: 1,
                total: 1,
                seats: 1,
                expiresAt: 1,
                cart: {
                    $map: {
                        input: { $ifNull: ['$cart', []] },
                        as: 'c',
                        in: {
                            nombre: '$$c.nombre',
                            qty: '$$c.qty',
                            unitPrice: '$$c.unitPrice',
                            menuItemId: '$$c.menuItemId'
                        }
                    }
                },
                showtime: {
                    id: { $toString: '$st._id' },
                    fechaHora: '$st.fechaHora',
                    sala: '$st.sala',
                    price: { $ifNull: ['$st.price', 0] }
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
    ]

    // -------- Pipeline COUNT (consistente con items) --------
    const countPipeline: any[] = [
        { $match: baseMatch },
        {
            $lookup: {
                from: 'showtimes',
                localField: 'showtimeId',
                foreignField: '_id',
                as: 'st'
            }
        },
        { $unwind: '$st' },
        ...(upcoming !== null
            ? [{ $match: upcoming ? { 'st.fechaHora': { $gte: now } } : { 'st.fechaHora': { $lt: now } } }]
            : []),
        { $count: 'total' }
    ]

    const [items, totalAgg] = await Promise.all([
        Reservation.aggregate(itemsPipeline),
        Reservation.aggregate(countPipeline)
    ])

    const total = totalAgg?.[0]?.total ?? 0

    return { items, page, pageSize, total }
})
