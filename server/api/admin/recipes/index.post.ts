import { connectDB } from '@/server/utils/mongoose'
import { Recipe, type IRecipe } from '@/server/models/Recipe'
import { readSession } from '@/server/utils/session'

export default defineEventHandler(async (event) => {
  await connectDB()
  const session = await readSession(event)
  if (!session || !session.isAdmin) throw createError({ statusCode: 403 })

  const body = await readBody(event)
  
  if (body.ingredients) {
    body.ingredients = body.ingredients.map((r: any) => ({
      ingredientId: r.ingredientId,
      qtyRatio: Number(r.qtyRatio) || 0
    }))
  }

  const item = await Recipe.create(body) as IRecipe
  return item
})
