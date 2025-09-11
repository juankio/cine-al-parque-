import { connectDB } from '@/server/utils/mongoose'

export default defineEventHandler(async () => {
    await connectDB()
    return { ok: true, db: 'connected' }
})
