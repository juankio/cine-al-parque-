import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Movie } from '@/server/models/Movie'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const q = getQuery(event)
    const page = Math.max(1, Number(q.page || 1))
    const pageSize = Math.min(50, Math.max(1, Number(q.pageSize || 10)))
    const text = String(q.q || '').trim()

    const filter = text ? {
        $or: [
            { titulo: { $regex: text, $options: 'i' } },
            { clasificacion: { $regex: text, $options: 'i' } }
        ]
    } : {}

    const [items, total] = await Promise.all([
        Movie.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
        Movie.countDocuments(filter)
    ])

    return { items, page, pageSize, total }
})
