import { connectDB } from '@/server/utils/mongoose'
import { Ingredient, type IIngredient } from '@/server/models/Ingredient'
import { readSession } from '@/server/utils/session'

export default defineEventHandler(async (event) => {
  await connectDB()
  const session = await readSession(event)
  if (!session || !session.isAdmin) throw createError({ statusCode: 403 })

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const updated = await Ingredient.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true }
  ).lean<IIngredient>()

  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return updated
})
