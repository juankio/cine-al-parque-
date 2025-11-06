import { getQuery } from 'h3'
import { connectDB } from '@/server/utils/mongoose'
import { MenuItem } from '@/server/models/MenuItem'

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const toStringSafe = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const parseTags = (raw: unknown): string[] => {
    if (Array.isArray(raw)) {
        return raw
            .map(toStringSafe)
            .filter(Boolean)
    }
    const str = toStringSafe(raw)
    if (!str) return []
    return str
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
}

export default defineEventHandler(async (event) => {
    await connectDB()

    const q = getQuery(event)
    const page = Math.max(1, Number(q.page || 1))
    const pageSize = Math.min(100, Math.max(1, Number(q.pageSize || 20)))

    const filters: Record<string, any> = { activo: true }

    const term = toStringSafe(q.q || q.search)
    if (term) {
        filters.nombre = { $regex: new RegExp(escapeRegex(term), 'i') }
    }

    const categoria = toStringSafe(q.categoria)
    if (categoria) {
        filters.categoria = { $regex: new RegExp(escapeRegex(categoria), 'i') }
    }

    const tags = parseTags(q.tags)
    if (tags.length) {
        filters.tags = { $in: tags }
    }

    const cursor = MenuItem.find(filters)
        .select('nombre precio categoria tags descripcion activo createdAt')
        .sort({ nombre: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean()

    const count = MenuItem.countDocuments(filters)

    const [items, total] = await Promise.all([cursor, count])

    return { items, page, pageSize, total }
})
