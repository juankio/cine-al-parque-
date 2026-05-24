import { connectDB } from '@/server/utils/mongoose'
import { Ingredient, type IIngredient } from '@/server/models/Ingredient'
import { readSession } from '@/server/utils/session'

export default defineEventHandler(async (event) => {
  await connectDB()
  const session = await readSession(event)
  if (!session || !session.isAdmin) throw createError({ statusCode: 403 })

  const body = await readBody(event)
  const item = await Ingredient.create(body) as IIngredient
  return item
})
