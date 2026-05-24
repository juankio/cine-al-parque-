import { connectDB } from '@/server/utils/mongoose'
import { MenuItem, type IMenuItem } from '@/server/models/MenuItem'
import { readSession } from '@/server/utils/session'

export default defineEventHandler(async (event) => {
  await connectDB()
  const session = await readSession(event)
  if (!session || !session.isAdmin) throw createError({ statusCode: 403 })

  const id = getRouterParam(event, 'id')
  const item = await MenuItem.findById(id).lean<IMenuItem>()
  if (!item) throw createError({ statusCode: 404 })
  
  return item
})
