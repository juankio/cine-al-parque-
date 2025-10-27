import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Recipe } from '@/server/models/Recipe'

type BodyItem = { ingredientId: string; qtyBase: number | string }
type Body = {
    nombre: string
    porciones?: number | string
    activo?: boolean
    items: BodyItem[]
}

function toNumberOrNull(v: unknown) {
    if (v === null || v === undefined) return null
    if (typeof v === 'number') return Number.isFinite(v) ? v : null
    const s = String(v).trim()
    if (!s) return null
    const n = Number(s.replace(',', '.'))
    return Number.isFinite(n) ? n : null
}

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)

    const b = await readBody<Body>(event)
    if (!b?.nombre || !Array.isArray(b.items)) {
        throw createError({ statusCode: 400, statusMessage: 'nombre e items son requeridos' })
    }

    const porcionesNum = toNumberOrNull(b.porciones ?? 1)
    if (porcionesNum === null || porcionesNum < 1) {
        throw createError({ statusCode: 400, statusMessage: 'porciones debe ser número >= 1' })
    }

    const items = b.items
        .map(i => {
            const qty = toNumberOrNull(i.qtyBase)
            return { ingredientId: String(i.ingredientId), qtyBase: qty }
        })
        .filter(i => i.ingredientId && i.qtyBase !== null && (i.qtyBase as number) >= 0)
        .map(i => ({ ingredientId: i.ingredientId, qtyBase: i.qtyBase as number }))

    if (!items.length) {
        throw createError({ statusCode: 400, statusMessage: 'items debe tener al menos 1 ingrediente válido' })
    }

    const doc = await Recipe.create({
        nombre: b.nombre.trim(),
        porciones: porcionesNum,
        activo: b.activo ?? true,
        items
    })

    return { ok: true, recipe: { id: String(doc._id) } }
})
