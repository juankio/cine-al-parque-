import { connectDB } from '@/server/utils/mongoose'
import { MenuItem, type IMenuItem } from '@/server/models/MenuItem'
import { readSession } from '@/server/utils/session'

export default defineEventHandler(async (event) => {
  await connectDB()
  const session = await readSession(event)
  if (!session || !session.isAdmin) throw createError({ statusCode: 403 })

  const body = await readBody(event)
  const item = await MenuItem.create(body) as IMenuItem
  return item
})
