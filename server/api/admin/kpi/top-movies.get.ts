import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Reservation } from '@/server/models/Reservation'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const q = getQuery(event)
    const from = q.from ? new Date(String(q.from)) : null
    const to = q.to ? new Date(String(q.to)) : null
    const limit = Math.min(50, Math.max(1, Number(q.limit || 10)))

    const dateMatch: any = {}
    if (from) dateMatch.$gte = from
    if (to) dateMatch.$lte = to

    const resMatch: any = { status: 'paid' }
    if (from || to) resMatch.createdAt = dateMatch

    const items = await Reservation.aggregate([
        { $match: resMatch },
        {
            $lookup: { from: 'showtimes', localField: 'showtimeId', foreignField: '_id', as: 'st' }
        },
        { $unwind: '$st' },
        {
            $lookup: { from: 'movies', localField: 'st.movieId', foreignField: '_id', as: 'mv' }
        },
        { $unwind: '$mv' },
        {
            $addFields: {
                seatsCount: { $size: '$seats' },
                seatPrice: { $ifNull: ['$st.price', 0] }
            }
        },
        {
            $group: {
                _id: '$mv._id',
                titulo: { $first: '$mv.titulo' },
                tickets: { $sum: '$seatsCount' },
                seatsRevenue: { $sum: { $multiply: ['$seatsCount', '$seatPrice'] } }
            }
        },
        { $sort: { tickets: -1, seatsRevenue: -1 } },
        { $limit: limit }
    ])

    return { items }
})
