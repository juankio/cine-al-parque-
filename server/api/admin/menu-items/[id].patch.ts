import { connectDB } from '~/server/utils/mongoose'
// /server/api/admin/menu-items/[id].patch.ts
import { MenuItem } from '~/server/models/MenuItem'
import { Types } from 'mongoose'

export default defineEventHandler(async (event) => {
    await connectDB()

    const id = getRouterParam(event, 'id')
    const body = await readBody<any>(event)
    const patch: any = {}

    if (body.nombre !== undefined)
        patch.nombre = String(body.nombre).trim()
    if (body.precio !== undefined)
        patch.precio = Number(body.precio) || 0
    if (body.porciones !== undefined)
        patch.porciones = Math.max(1, Number(body.porciones) || 1)
    if (body.descripcion !== undefined)
        patch.descripcion = String(body.descripcion ?? '')
    if (body.categoria !== undefined)
        patch.categoria = String(body.categoria ?? '')
    if (body.activo !== undefined)
        patch.activo = Boolean(body.activo)

    // Tags
    if (body.tags !== undefined) {
        patch.tags = Array.isArray(body.tags)
            ? body.tags.map((t: any) => String(t)).filter(Boolean)
            : []
    }

    // Recetas (multi)
    let recipeIds: string[] = []
    if (Array.isArray(body.recipeIds)) {
        recipeIds = body.recipeIds
    } else if (body.recipeId) {
        recipeIds = [String(body.recipeId)]
    }

    if (recipeIds.length) {
        patch.recipeIds = recipeIds
        patch.recipeId = recipeIds[0]
    } else if (body.recipeIds !== undefined || body.recipeId !== undefined) {
        patch.recipeIds = []
        patch.recipeId = null
    }

    // Extras (por si los usas en el futuro)
    if (body.extras !== undefined) {
        patch.extras = Array.isArray(body.extras) ? body.extras : []
    }

    const updated = await MenuItem.findByIdAndUpdate(
        new Types.ObjectId(id),
        patch,
        { new: true }
    )
    return updated
})
