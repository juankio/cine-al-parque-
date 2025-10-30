import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { MenuItem } from '@/server/models/MenuItem'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const id = getRouterParam(event, 'id')
    const b = await readBody(event)

    const update: any = {}

    if ('nombre' in b) {
        const v = String(b.nombre || '').trim()
        if (!v) throw createError({ statusCode: 400, statusMessage: 'nombre requerido' })
        update.nombre = v
    }
    if ('precio' in b) {
        const p = Number(b.precio)
        if (!Number.isFinite(p) || p < 0) throw createError({ statusCode: 400, statusMessage: 'precio inválido' })
        update.precio = p
    }
    if ('recipeId' in b) update.recipeId = b.recipeId ? String(b.recipeId) : null
    if ('porciones' in b) {
        const por = Math.max(1, Number(b.porciones || 1))
        update.porciones = por
    }
    if ('activo' in b) update.activo = !!b.activo
    if ('descripcion' in b) update.descripcion = String(b.descripcion || '').trim()
    if ('categoria' in b) update.categoria = String(b.categoria || '').trim()
    if ('tags' in b && Array.isArray(b.tags)) {
        update.tags = b.tags.map((t: string) => String(t).trim()).filter(Boolean)
    }
    if ('extras' in b && Array.isArray(b.extras)) {
        update.extras = b.extras
            .map((x: any) => ({ ingredientId: x.ingredientId, qtyExtra: Number(x.qtyExtra) }))
            .filter((x: any) => x.ingredientId && Number.isFinite(x.qtyExtra) && x.qtyExtra >= 0)
    }

    const doc = await MenuItem.findByIdAndUpdate(id, update, { new: true })
    if (!doc) throw createError({ statusCode: 404, statusMessage: 'No encontrado' })
    return { ok: true }
})
