// server/api/admin/ingredients/index.get.ts
import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Ingredient } from '@/server/models/Ingredient'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)

    const query = getQuery(event)
    const q = query.q ? String(query.q) : ''
    const activoParam = typeof query.activo === 'string' ? query.activo : undefined
    const page = Number(query.page || 1)
    const pageSize = Number(query.pageSize || 20)

    const filter: Record<string, any> = {}
    if (q) filter.nombre = { $regex: q, $options: 'i' }
    if (activoParam === 'true') filter.activo = true
    else if (activoParam === 'false') filter.activo = false

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
