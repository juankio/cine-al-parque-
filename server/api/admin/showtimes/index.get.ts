import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Showtime } from '@/server/models/Showtime'
import { Types } from 'mongoose'

export default defineEventHandler(async (event) => {
    await connectDB()
    await requireAdmin(event)

    const q = getQuery(event)
    const movieId = typeof q.movieId === 'string' ? q.movieId.trim() : ''
    const page = Math.max(1, Number(q.page ?? 1))
    const pageSize = Math.min(100, Math.max(1, Number(q.pageSize ?? 50)))
    const upcoming = typeof q.upcoming === 'string' ? q.upcoming : null // 'true'|'false'|null

    const match: any = {}
    if (movieId && Types.ObjectId.isValid(movieId)) {
        match.movieId = new Types.ObjectId(movieId)
    }

    const now = new Date()
    if (upcoming === 'true') {
        match.fechaHora = { $gte: now }    // solo próximas
    } else if (upcoming === 'false') {
        match.fechaHora = { $lt: now }     // solo pasadas
    }

    const [items, total] = await Promise.all([
        Showtime.find(match)
            .sort({ fechaHora: 1 })                // próximas primero
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .lean(),
        Showtime.countDocuments(match),
    ])

    return { items, page, pageSize, total }
})
