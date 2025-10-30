import { connectDB } from '~/server/utils/mongoose'
import { MenuItem } from '~/server/models/MenuItem'

export default defineEventHandler(async (event) => {
    await connectDB() // <- garantiza conexión

    const body = await readBody<any>(event)

    const recipeIds = Array.isArray(body.recipeIds)
        ? body.recipeIds.map(String).filter(Boolean)
        : (body.recipeId ? [String(body.recipeId)] : [])

    const doc = await MenuItem.create({
        nombre: String(body.nombre ?? '').trim(),
        precio: Number(body.precio) || 0,
        porciones: Math.max(1, Number(body.porciones) || 1),
        descripcion: String(body.descripcion ?? ''),
        categoria: String(body.categoria ?? ''),
        activo: Boolean(body.activo),
        tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
        recipeIds,
        recipeId: recipeIds[0] ?? null,
        extras: Array.isArray(body.extras) ? body.extras : []
    })

    return doc
})
