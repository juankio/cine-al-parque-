import { connectDB } from '@/server/utils/mongoose'
import { User } from '@/server/models/User'
import { verifyPassword } from '@/server/utils/hash'
import { createSession } from '@/server/utils/session'

export default defineEventHandler(async (event) => {
    await connectDB()

    const body = await readBody<{ email?: string, password?: string }>(event)
    const email = (body.email || '').trim().toLowerCase()
    const password = body.password || ''

    if (!email || !password) throw createError({ statusCode: 400, statusMessage: 'Faltan credenciales' })

    const user = await User.findOne({ email })
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Credenciales inválidas' })

    const ok = await verifyPassword(password, user.passwordHash)
    if (!ok) throw createError({ statusCode: 401, statusMessage: 'Credenciales inválidas' })

    await createSession(event, { id: String(user._id), name: user.name, email: user.email })
    return { ok: true, user: { id: String(user._id), name: user.name, email: user.email } }
})
