// server/api/admin/ingredients/index.get.ts
import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Ingredient } from '@/server/models/Ingredient'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)

    const q = getQuery(event).q ? String(getQuery(event).q) : ''
    const page = Number(getQuery(event).page || 1)
    const pageSize = Number(getQuery(event).pageSize || 20)

    const filter = q
        ? { nombre: { $regex: q, $options: 'i' } }
        : {}

    const [items, total] = await Promise.all([
        Ingredient.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .lean(),
        Ingredient.countDocuments(filter)
    ])

    return { items, page, pageSize, total }
})
