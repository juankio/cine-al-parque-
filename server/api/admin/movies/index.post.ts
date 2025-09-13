import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Movie } from '@/server/models/Movie'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const body = await readBody(event)
    const doc = await Movie.create({
        titulo: body.titulo,
        sinopsis: body.sinopsis || '',
        poster: body.poster || '',
        duracion: Number(body.duracion || 0),
        clasificacion: body.clasificacion || '',
        price: Number(body.price || 0),
        active: body.active !== false
    })
    return { ok: true, movie: { id: String(doc._id) } }
})
