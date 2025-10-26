// server/api/admin/ingredients/index.post.ts
import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Ingredient } from '@/server/models/Ingredient'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const b = await readBody(event)

    // Campos aceptados
    const doc = await Ingredient.create({
        nombre: String(b.nombre).trim(),
        unidad: String(b.unidad || 'unid'),
        stockBase: Number(b.stockBase || 0),
        costoPromedio: Number(b.costoPromedio || 0),
        activo: b.activo === undefined ? true : Boolean(b.activo)
    })

    return doc.toJSON()
})
