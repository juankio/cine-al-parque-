import { connectDB } from '@/server/utils/mongoose'
import { Movie } from '@/server/models/Movie'

export default defineEventHandler(async () => {
    await connectDB()
    const movies = await Movie.find().sort({ createdAt: -1 }).lean()
    return movies
})
