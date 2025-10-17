// /server/api/admin/showtimes/index.post.ts
import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Showtime } from '@/server/models/Showtime'
import { createError, readBody, setResponseStatus } from 'h3'
import { Types } from 'mongoose'

export default defineEventHandler(async (event) => {
    await connectDB()
    await requireAdmin(event)

    const body = await readBody<{
        movieId?: string
        fechaHora?: string
        sala?: string
        price?: number
    }>(event)

    if (!body?.movieId || !Types.ObjectId.isValid(body.movieId)) {
        throw createError({ statusCode: 400, message: 'movieId inválido' })
    }
    if (!body.fechaHora) throw createError({ statusCode: 400, message: 'fechaHora requerida' })
    if (!body.sala) throw createError({ statusCode: 400, message: 'sala requerida' })
    if (typeof body.price !== 'number' || isNaN(body.price)) {
        throw createError({ statusCode: 400, message: 'price inválido' })
    }

    const doc = await Showtime.create({
        movieId: new Types.ObjectId(body.movieId),
        fechaHora: new Date(body.fechaHora),
        sala: body.sala.trim(),
        price: body.price,
    })

    // 201 Created + payload útil para el front (usamos _id porque decidiste mantenerlo)
    setResponseStatus(event, 201)
    return {
        ok: true,
        showtime: {
            _id: String(doc._id),
            movieId: String(doc.movieId),
            fechaHora: doc.fechaHora.toISOString(),
            sala: doc.sala,
            price: doc.price,
        },
    }
})
