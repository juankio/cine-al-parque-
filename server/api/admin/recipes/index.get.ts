import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Recipe } from '@/server/models/Recipe'
import { Ingredient } from '@/server/models/Ingredient'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const q = getQuery(event)

    const page = Math.max(1, Number(q.page || 1))
    const pageSize = Math.min(100, Math.max(1, Number(q.pageSize || 20)))
    const text = String(q.q || '').trim()
    const activoQ = typeof q.activo === 'string' ? q.activo : undefined
    const activoFilter =
        activoQ === 'true' ? true :
            activoQ === 'false' ? false :
                undefined

    const filter: any = {}
    if (text) filter.nombre = { $regex: text, $options: 'i' }
    if (typeof activoFilter === 'boolean') filter.activo = activoFilter

    const [items, total] = await Promise.all([
        Recipe.find(filter)
            .sort({ nombre: 1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .lean(),
        Recipe.countDocuments(filter)
    ])

    const ingredientIds = Array.from(new Set(items.flatMap(r => (r.items || []).map((it: any) => String(it.ingredientId)))))
    const ingredients = await Ingredient.find({ _id: { $in: ingredientIds } }).select('stockBase activo nombre unidad').lean()
    const ingMap = new Map(ingredients.map((ing: any) => [String(ing._id), ing]))

    const hydrated = items.map((recipe: any) => {
        let available = true
        for (const item of recipe.items || []) {
            const ing = ingMap.get(String(item.ingredientId))
            const qty = typeof item.qtyBase === 'number' ? item.qtyBase : Number(item.qtyBase) || 0
            if (ing) {
                item.ingredient = {
                    _id: ing._id,
                    nombre: ing.nombre,
                    unidad: ing.unidad,
                    activo: ing.activo,
                    stockBase: ing.stockBase,
                }
            }
            if (!ing || !ing.activo || (qty > 0 && Number(ing.stockBase ?? 0) < qty)) {
                available = false
                break
            }
        }
        recipe.available = available
        if (!available) recipe.activo = false
        return recipe
    })

    return { items: hydrated, page, pageSize, total }
})
