import { connectDB } from '~/server/utils/mongoose'
import { createError, readBody } from 'h3'
import bcrypt from 'bcrypt'
import crypto from 'node:crypto'
import { usersCol } from '~/server/utils/db'
import { createSession } from '~/server/utils/auth'
import { isAdminEmail } from '~/server/utils/admin'

function looksLikeBcrypt(hash?: string) {
    return !!hash && (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$'))
}
function safeEq(a: string, b: string) {
    const A = Buffer.from(a)
    const B = Buffer.from(b)
    if (A.length !== B.length) return false
    return crypto.timingSafeEqual(A, B)
}

export default defineEventHandler(async (event) => {
    await connectDB()

    const body = await readBody<{ email?: string; password?: string; remember?: boolean }>(event)
    const email = (body?.email || '').toLowerCase().trim()
    const password = String(body?.password || '')
    const remember = !!body?.remember

    console.log('[API login] IN', email, 'remember:', remember)
    if (!email || !password) {
        throw createError({ statusCode: 400, message: 'Email y contraseña requeridos' })
    }

    const col = await usersCol()
    const user: any = await col.findOne({ email })
    if (!user) throw createError({ statusCode: 401, message: 'Credenciales inválidas' })

    const stored = user.passwordHash || user.password
    if (!stored) throw createError({ statusCode: 401, message: 'Credenciales inválidas' })

    let ok = false
    if (looksLikeBcrypt(stored)) {
        ok = await bcrypt.compare(password, stored)
    } else {
        ok = safeEq(password, String(stored))
        if (ok) {
            const newHash = await bcrypt.hash(password, 10)
            await col.updateOne({ _id: user._id }, { $set: { passwordHash: newHash }, $unset: { password: '' } })
            console.log('[API login] migrated legacy password → bcrypt')
        }
    }

    if (!ok) throw createError({ statusCode: 401, message: 'Credenciales inválidas' })

    // 👇 NEW: admin por ENV (y respetamos el flag guardado si ya existe)
    const isAdmin = isAdminEmail(email) || !!user.isAdmin

    const payload = {
        sub: String(user._id),
        email: user.email,
        isAdmin,
        name: user.name,
    }
    createSession(event, payload, remember)

    console.log('[API login] OUT ok', email, 'isAdmin:', isAdmin)
    return {
        ok: true,
        user: { id: String(user._id), email: user.email, name: user.name, isAdmin }
    }
})
