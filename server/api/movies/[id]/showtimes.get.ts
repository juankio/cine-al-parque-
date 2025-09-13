import { connectDB } from '@/server/utils/mongoose'
import { Showtime } from '@/server/models/Showtime'

export default defineEventHandler(async (event) => {
    await connectDB()
    const movieId = getRouterParam(event, 'id')
    const now = new Date()

    const items = await Showtime.find({
        movieId,
        active: true,
        fechaHora: { $gte: now }
    }).sort({ fechaHora: 1 }).lean()

    return items
})
