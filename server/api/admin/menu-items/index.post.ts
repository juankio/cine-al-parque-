import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { MenuItem } from '@/server/models/MenuItem'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const b = await readBody(event)

    // Sanitizar
    const nombre = String(b?.nombre || '').trim()
    const precio = Number(b?.precio ?? NaN)
    const recipeId = b?.recipeId ? String(b.recipeId) : null
    const porciones = Math.max(1, Number(b?.porciones || 1))
    const activo = !!b?.activo
    const descripcion = String(b?.descripcion || '').trim()
    const categoria = String(b?.categoria || '').trim()
    const tags = Array.isArray(b?.tags) ? b.tags.map((t: string) => String(t).trim()).filter(Boolean) : []

    const extras = Array.isArray(b?.extras)
        ? b.extras
            .map((x: any) => ({ ingredientId: x.ingredientId, qtyExtra: Number(x.qtyExtra) }))
            .filter((x: any) => x.ingredientId && Number.isFinite(x.qtyExtra) && x.qtyExtra >= 0)
        : []

    if (!nombre) throw createError({ statusCode: 400, statusMessage: 'nombre requerido' })
    if (!Number.isFinite(precio) || precio < 0) throw createError({ statusCode: 400, statusMessage: 'precio inválido' })

    const doc = await MenuItem.create({
        nombre, precio, recipeId, porciones, activo, descripcion, categoria, tags, extras
    })

    return { ok: true, item: { id: String(doc._id) } }
})
