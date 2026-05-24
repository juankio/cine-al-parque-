import { connectDB } from '@/server/utils/mongoose'
import { MenuItem, type IMenuItem } from '@/server/models/MenuItem'
import { readSession } from '@/server/utils/session'

export default defineEventHandler(async (event) => {
  await connectDB()
  const session = await readSession(event)
  if (!session || !session.isAdmin) throw createError({ statusCode: 403 })

  const query = getQuery(event)
  const filter: any = {}
  
  if (query.q) filter.nombre = { $regex: String(query.q), $options: 'i' }
  if (query.cat) filter.categoria = String(query.cat)

  const items = await MenuItem.find(filter)
    .sort({ nombre: 1 })
    .lean<IMenuItem[]>()
    
  return items
})
