import { connectDB } from '@/server/utils/mongoose'
import { Movie } from '@/server/models/Movie'

const toPlainId = (value: any) => {
    if (!value) return ''
    if (typeof value === 'string') return value
    if (value && typeof value.toString === 'function') {
        return value.toString()
    }
    return `${value}`
}

export default defineEventHandler(async () => {
    await connectDB()
    const items = await Movie.find({ active: true }).sort({ createdAt: -1 }).lean()

    return items.map((item: any) => ({
        ...item,
        id: toPlainId(item.id ?? item._id)
    }))
})
