import { createError, readBody } from 'h3'
import { createSession } from '~/server/utils/auth'

/**
 * Ajusta esta parte a tu acceso a DB.
 * Debes devolver un objeto user con { _id, email, name, isAdmin, passwordHash }.
 */
async function findUserByEmail(email: string) {
    // TODO: reemplaza por tu acceso real (ej. Mongo)
    // return await UserModel.findOne({ email })
    return null
}

async function verifyPassword(plain: string, hash: string) {
    // TODO: reemplaza por tu verificación real (bcrypt.compare, etc.)
    return false
}

export default defineEventHandler(async (event) => {
    const body = await readBody<{ email?: string; password?: string; remember?: boolean }>(event)
    if (!body?.email || !body?.password) {
        throw createError({ statusCode: 400, statusMessage: 'Email y contraseña requeridos' })
    }

    // 1) Busca el usuario
    const user: any = await findUserByEmail(body.email)
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Credenciales inválidas' })
    }

    // 2) Verifica contraseña
    const ok = await verifyPassword(body.password, user.passwordHash)
    if (!ok) {
        throw createError({ statusCode: 401, statusMessage: 'Credenciales inválidas' })
    }

    // 3) Crea la cookie de sesión respetando remember
    const payload = {
        sub: String(user._id),
        email: user.email,
        isAdmin: !!user.isAdmin,
        name: user.name,
    }
    createSession(event, payload, !!body.remember)

    // 4) Respuesta (lo que ya consumes en el front)
    return {
        ok: true,
        user: { id: String(user._id), email: user.email, name: user.name, isAdmin: !!user.isAdmin },
    }
})
