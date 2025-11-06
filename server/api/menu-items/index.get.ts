import { getQuery } from 'h3'
import { connectDB } from '@/server/utils/mongoose'
import { MenuItem } from '@/server/models/MenuItem'

export default defineEventHandler(async (event) => {
    await connectDB()

    const q = getQuery(event)
    const page = Math.max(1, Number(q.page || 1))
    const pageSize = Math.min(100, Math.max(1, Number(q.pageSize || 20)))

    const [items, total] = await Promise.all([
        MenuItem.find({ activo: true })
            .select('nombre precio categoria tags descripcion activo createdAt')
            .sort({ nombre: 1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .lean(),
        MenuItem.countDocuments({ activo: true })
    ])

    return { items, page, pageSize, total }
})
