import { connectDB } from '@/server/utils/mongoose'
import { MenuItem, type IMenuItem } from '@/server/models/MenuItem'
import { readSession } from '@/server/utils/session'

export default defineEventHandler(async (event) => {
  await connectDB()
  const session = await readSession(event)
  if (!session || !session.isAdmin) throw createError({ statusCode: 403 })

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (body.recipe) {
    body.recipe = body.recipe.map((r: any) => ({
      ingredientId: r.ingredientId,
      qty: Number(r.qty) || 0
    }))
  }

  const updated = await MenuItem.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true }
  ).lean<IMenuItem>()

  if (!updated) throw createError({ statusCode: 404 })
  return updated
})
