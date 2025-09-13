import { connectDB } from '@/server/utils/mongoose'
import { Movie } from '@/server/models/Movie'

export default defineEventHandler(async () => {
    await connectDB()
    const items = await Movie.find({ active: true }).sort({ createdAt: -1 }).lean()
    return items
})
