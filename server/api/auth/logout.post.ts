import { connectDB } from '~/server/utils/mongoose'
import { clearSessionCookie } from '~/server/utils/auth'
export default defineEventHandler(async (event) => {
    await connectDB()

    clearSessionCookie(event)
    return { ok: true }
})
