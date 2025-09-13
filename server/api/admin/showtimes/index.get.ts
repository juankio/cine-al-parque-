import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Showtime } from '@/server/models/Showtime'
import { Movie } from '@/server/models/Movie'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const q = getQuery(event)
    const page = Math.max(1, Number(q.page || 1))
    const pageSize = Math.min(50, Math.max(1, Number(q.pageSize || 10)))
    const movieId = q.movieId ? String(q.movieId) : null

    const filter: any = {}
    if (movieId) filter.movieId = movieId

    const [items, total] = await Promise.all([
        Showtime.find(filter).sort({ fechaHora: 1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
        Showtime.countDocuments(filter)
    ])

    // opcional: inyectar título de la película (ayuda en admin)
    const movieMap = new Map<string, string>()
    if (items.length) {
        const ids = [...new Set(items.map(i => String(i.movieId)))]
        const movies = await Movie.find({ _id: { $in: ids } }).select('_id titulo').lean()
        movies.forEach(m => movieMap.set(String(m._id), m.titulo))
    }
    const withMovie = items.map(i => ({ ...i, movieTitulo: movieMap.get(String(i.movieId)) || '' }))

    return { items: withMovie, page, pageSize, total }
})
