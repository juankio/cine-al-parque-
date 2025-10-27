import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Recipe } from '@/server/models/Recipe'

type BodyItem = { ingredientId: string; qtyBase: number | string }
type Body = Partial<{
    nombre: string
    porciones: number | string
    activo: boolean
    items: BodyItem[]
}>

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
    const id = getRouterParam(event, 'id')
    const b = await readBody<Body>(event)

    const update: any = {}

    if ('nombre' in b) {
        const nombre = String(b.nombre ?? '').trim()
        if (!nombre) throw createError({ statusCode: 400, statusMessage: 'nombre no puede estar vacío' })
        update.nombre = nombre
    }

    if ('porciones' in b) {
        const porcionesNum = toNumberOrNull(b.porciones)
        if (porcionesNum === null || porcionesNum < 1) {
            throw createError({ statusCode: 400, statusMessage: 'porciones debe ser número >= 1' })
        }
        update.porciones = porcionesNum
    }

    if ('activo' in b) {
        update.activo = !!b.activo
    }

    if ('items' in b) {
        if (!Array.isArray(b.items)) {
            throw createError({ statusCode: 400, statusMessage: 'items debe ser arreglo' })
        }
        const items = b.items
            .map(i => {
                const qty = toNumberOrNull(i?.qtyBase)
                return { ingredientId: String(i?.ingredientId || ''), qtyBase: qty }
            })
            .filter(i => i.ingredientId && i.qtyBase !== null && (i.qtyBase as number) >= 0)
            .map(i => ({ ingredientId: i.ingredientId, qtyBase: i.qtyBase as number }))

        if (!items.length) {
            throw createError({ statusCode: 400, statusMessage: 'items debe tener al menos 1 ingrediente válido' })
        }
        update.items = items
    }

    if (!Object.keys(update).length) {
        throw createError({ statusCode: 400, statusMessage: 'No hay cambios para aplicar' })
    }

    const doc = await Recipe.findByIdAndUpdate(id, update, { new: true })
    if (!doc) throw createError({ statusCode: 404, statusMessage: 'No encontrado' })

    return { ok: true, recipe: { id: String(doc._id) } }
})
