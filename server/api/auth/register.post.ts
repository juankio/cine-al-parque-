import { createError, readBody } from 'h3'
import bcrypt from 'bcrypt'
import { usersCol } from '~/server/utils/db'
import { createSession } from '~/server/utils/auth'

function parseAdminEmails(s: string) {
    return (s || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean)
}

export default defineEventHandler(async (event) => {
    const { adminEmails } = useRuntimeConfig()
    const allowAdmins = parseAdminEmails(adminEmails)

    const body = await readBody<{ name?: string; email?: string; password?: string }>(event)
    const name = (body?.name || '').trim()
    const email = (body?.email || '').trim().toLowerCase()
    const password = String(body?.password || '')

    if (!name) throw createError({ statusCode: 400, message: 'Nombre requerido' })
    if (!email || !/.+@.+\..+/.test(email)) throw createError({ statusCode: 400, message: 'Correo inválido' })
    if (password.length < 6) throw createError({ statusCode: 400, message: 'La contraseña debe tener al menos 6 caracteres' })

    const col = await usersCol()
    const existing = await col.findOne({ email }, { projection: { _id: 1 } })
    if (existing) throw createError({ statusCode: 409, message: 'El correo ya está registrado' })

    const passwordHash = await bcrypt.hash(password, 10)
    const isAdmin = allowAdmins.includes(email)
    const now = new Date()

    const insertRes = await col.insertOne({ name, email, passwordHash, isAdmin, createdAt: now, updatedAt: now })
    const userId = String(insertRes.insertedId)

    createSession(event, { sub: userId, email, isAdmin, name }, false)

    return { ok: true, user: { id: userId, name, email, isAdmin } }
})
