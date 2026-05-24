import { connectDB } from '@/server/utils/mongoose'
import { Recipe, type IRecipe } from '@/server/models/Recipe'
import { Ingredient, type IIngredient } from '@/server/models/Ingredient'
import { readSession } from '@/server/utils/session'

export default defineEventHandler(async (event) => {
  await connectDB()
  const session = await readSession(event)
  if (!session || !session.isAdmin) throw createError({ statusCode: 403 })

  const query = getQuery(event)
  const q = query.q ? String(query.q) : ''
  const filter = q ? { nombre: { $regex: q, $options: 'i' } } : {}

  const items = await Recipe.find(filter)
    .sort({ nombre: 1 })
    .lean<IRecipe[]>()

  const allIngredients = await Ingredient.find().lean<IIngredient[]>()
  const ingMap = new Map(allIngredients.map((i: IIngredient) => [String(i._id), i]))

  return items.map((r: IRecipe) => {
    return {
      _id: r._id,
      nombre: r.nombre,
      unidad: r.unidad,
      activo: r.activo,
      stockBase: r.stockBase,
      ingredients: (r.ingredients || []).map((ri: any) => {
        const ing = ingMap.get(String(ri.ingredientId))
        return {
          ingredientId: ri.ingredientId,
          qtyRatio: ri.qtyRatio,
          ingredientName: ing?.nombre || 'Desconocido',
          ingredientUnit: ing?.unidad || ''
        }
      })
    }
  })
})
