import { connectDB } from '@/server/utils/mongoose'
import { Recipe } from '@/server/models/Recipe'
import { readSession } from '@/server/utils/session'

export default defineEventHandler(async (event) => {
  await connectDB()
  const session = await readSession(event)
  if (!session || !session.isAdmin) throw createError({ statusCode: 403 })

  const id = getRouterParam(event, 'id')
  const deleted = await Recipe.findByIdAndDelete(id).lean()

  if (!deleted) throw createError({ statusCode: 404 })
  return { ok: true }
})
