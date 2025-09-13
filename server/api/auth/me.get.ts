import { readSession } from '@/server/utils/session'

export default defineEventHandler(async (event) => {
    const sess = await readSession(event)
    return { user: sess ? { id: sess.id, name: sess.name, email: sess.email } : null }
})
