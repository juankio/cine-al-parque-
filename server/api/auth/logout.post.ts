import { clearSession } from '@/server/utils/session'

export default defineEventHandler(async (event) => {
    clearSession(event)
    return { ok: true }
})
