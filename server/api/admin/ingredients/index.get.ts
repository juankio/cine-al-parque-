import { connectDB } from '@/server/utils/mongoose'
import { Ingredient, type IIngredient } from '@/server/models/Ingredient'
import { readSession } from '@/server/utils/session'

export default defineEventHandler(async (event) => {
  await connectDB()
  const session = await readSession(event)
  if (!session || !session.isAdmin) throw createError({ statusCode: 403 })

  const query = getQuery(event)
  const q = query.q ? String(query.q) : ''
  const filter = q ? { nombre: { $regex: q, $options: 'i' } } : {}

  const items = await Ingredient.find(filter)
    .sort({ nombre: 1 })
    .lean<IIngredient[]>()

  return items
})
