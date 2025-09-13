import { connectDB } from '@/server/utils/mongoose'
import { User } from '@/server/models/User'
import { hashPassword } from '@/server/utils/hash'
import { createSession } from '@/server/utils/session'

export default defineEventHandler(async (event) => {
    await connectDB()

    const body = await readBody<{ name?: string, email?: string, password?: string }>(event)
    const name = (body.name || '').trim()
    const email = (body.email || '').trim().toLowerCase()
    const password = body.password || ''

    if (!name || !email || !password) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan campos' })
    }

    const exists = await User.findOne({ email }).lean()
    if (exists) throw createError({ statusCode: 409, statusMessage: 'Correo ya registrado' })

    const passwordHash = await hashPassword(password)
    const doc = await User.create({ name, email, passwordHash })

    await createSession(event, { id: String(doc._id), name: doc.name, email: doc.email })
    return { ok: true, user: { id: String(doc._id), name: doc.name, email: doc.email } }
})
