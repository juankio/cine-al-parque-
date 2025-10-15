import { clearSessionCookie } from '~/server/utils/auth'
export default defineEventHandler(async (event) => {
    clearSessionCookie(event)
    return { ok: true }
})
