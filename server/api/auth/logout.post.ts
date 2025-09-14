import { destroySession } from '@/server/utils/session'

export default defineEventHandler(async (event) => {
    destroySession(event)
    return { ok: true }
})
