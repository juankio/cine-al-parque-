import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Recipe } from '@/server/models/Recipe'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const q = getQuery(event)

    const page = Math.max(1, Number(q.page || 1))
    const pageSize = Math.min(100, Math.max(1, Number(q.pageSize || 20)))
    const text = String(q.q || '').trim()
    const activoQ = typeof q.activo === 'string' ? q.activo : undefined
    const activoFilter =
        activoQ === 'true' ? true :
            activoQ === 'false' ? false :
                undefined

    const filter: any = {}
    if (text) filter.nombre = { $regex: text, $options: 'i' }
    if (typeof activoFilter === 'boolean') filter.activo = activoFilter

    const [items, total] = await Promise.all([
        Recipe.find(filter)
            .sort({ nombre: 1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .lean(),
        Recipe.countDocuments(filter)
    ])

    return { items, page, pageSize, total }
})
