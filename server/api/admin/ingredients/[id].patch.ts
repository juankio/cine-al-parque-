// ~/server/api/admin/ingredients/[id].patch.ts
import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Ingredient } from '@/server/models/Ingredient'

export default defineEventHandler(async (event) => {
    await connectDB()
    await requireAdmin(event)

    const id = getRouterParam(event, 'id')
    const b = await readBody(event)

    const update: any = {}
    if ('nombre' in b) update.nombre = String(b.nombre).trim()
    if ('unidad' in b) update.unidad = String(b.unidad).trim()
    if ('costoPromedio' in b) update.costoPromedio = Number(b.costoPromedio ?? 0)
    if ('stockBase' in b) update.stockBase = Number(b.stockBase ?? 0)
    if ('activo' in b) update.activo = !!b.activo

    const doc = await Ingredient.findByIdAndUpdate(id, update, { new: true })
    if (!doc) throw createError({ statusCode: 404, statusMessage: 'No encontrado' })

    return { ok: true, item: doc }
})
