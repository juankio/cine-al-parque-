import { connectDB } from '@/server/utils/mongoose'
import { Ingredient } from '@/server/models/Ingredient'
import { readSession } from '@/server/utils/session'

export default defineEventHandler(async (event) => {
  await connectDB()
  const session = await readSession(event)
  if (!session || !session.isAdmin) throw createError({ statusCode: 403 })

  const id = getRouterParam(event, 'id')
  const deleted = await Ingredient.findByIdAndDelete(id).lean()

  if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return { ok: true }
})
