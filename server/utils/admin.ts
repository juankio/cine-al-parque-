import { readSession } from '@/server/utils/session'

export async function requireAdmin(event) {
    const sess = await readSession(event)
    if (!sess?.email) {
        throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
    }
    const list = (process.env.NUXT_ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    if (!list.includes(sess.email.toLowerCase())) {
        throw createError({ statusCode: 403, statusMessage: 'No autorizado' })
    }
    return sess
}
