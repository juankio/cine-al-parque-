import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { MenuItem } from '@/server/models/MenuItem'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const q = getQuery(event)
    const page = Math.max(1, Number(q.page || 1))
    const pageSize = Math.min(100, Math.max(1, Number(q.pageSize || 20)))
    const text = String(q.q || '').trim()
    const onlyActive = q.active === 'true'

    const filter: any = {}
    if (text) filter.nombre = { $regex: text, $options: 'i' }
    if (onlyActive) filter.activo = true

    const [items, total] = await Promise.all([
        MenuItem.find(filter).sort({ nombre: 1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
        MenuItem.countDocuments(filter)
    ])
    return { items, page, pageSize, total }
})
