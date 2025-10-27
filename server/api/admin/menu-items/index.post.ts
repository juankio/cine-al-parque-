import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { MenuItem } from '@/server/models/MenuItem'

export default defineEventHandler(async (event) => {
    await connectDB()
    await requireAdmin(event)

    const b = await readBody<{ nombre: string; precio: number; recipeId?: string; activo?: boolean }>(event)

    if (!b?.nombre || typeof b.precio !== 'number')
        throw createError({ statusCode: 400, statusMessage: 'nombre y precio requeridos' })

    const doc = await MenuItem.create({
        nombre: b.nombre.trim(),
        precio: Number(b.precio),
        recipeId: b.recipeId || null,
        activo: b.activo ?? true
    })

    return { ok: true, menuItem: { id: String(doc._id) } }
})
