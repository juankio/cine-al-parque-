import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { MenuItem } from '@/server/models/MenuItem'
import { Recipe } from '@/server/models/Recipe'

export default defineEventHandler(async (event) => {
    await connectDB()
    await requireAdmin(event)

    const q = getQuery(event)
    const page = Math.max(1, Number(q.page || 1))
    const pageSize = Math.min(100, Math.max(1, Number(q.pageSize || 20)))
    const text = String(q.q || '').trim()

    const filter: any = text ? { nombre: { $regex: text, $options: 'i' } } : {}

    const [items, total] = await Promise.all([
        MenuItem.find(filter)
            .populate('recipeId', 'nombre')
            .sort({ nombre: 1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .lean(),
        MenuItem.countDocuments(filter)
    ])

    return { items, page, pageSize, total }
})
