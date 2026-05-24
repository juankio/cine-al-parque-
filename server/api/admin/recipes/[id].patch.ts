import { connectDB } from '@/server/utils/mongoose'
import { Recipe, type IRecipe } from '@/server/models/Recipe'
import { readSession } from '@/server/utils/session'

export default defineEventHandler(async (event) => {
  await connectDB()
  const session = await readSession(event)
  if (!session || !session.isAdmin) throw createError({ statusCode: 403 })

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (body.ingredients) {
    body.ingredients = body.ingredients.map((r: any) => ({
      ingredientId: r.ingredientId,
      qtyRatio: Number(r.qtyRatio) || 0
    }))
  }

  const updated = await Recipe.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true }
  ).lean<IRecipe>()

  if (!updated) throw createError({ statusCode: 404 })
  return updated
})
