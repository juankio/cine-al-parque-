// /server/utils/admin.ts
import { getSessionFromCookie } from '~/server/utils/auth'
import { createError } from 'h3'

/**
 * Devuelve true si el correo está listado como admin en la env NUXT_ADMIN_EMAILS.
 */
export function isAdminEmail(email: string): boolean {
    const { adminEmails } = useRuntimeConfig()
    if (!adminEmails) return false

    const list = String(adminEmails)
        .split(/[,\s;]+/)
        .map(e => e.trim().toLowerCase())
        .filter(Boolean)

    return list.includes(email.toLowerCase())
}

/**
 * Middleware para rutas del panel admin.
 * Lanza 401 si no hay sesión o 403 si no es admin.
 * Se usa dentro de endpoints server/api/admin/**
 *
 * Ejemplo:
 * ```ts
 * import { requireAdmin } from '~/server/utils/admin'
 * export default defineEventHandler(async (event) => {
 *   const admin = await requireAdmin(event)
 *   // tu lógica
 * })
 * ```
 */
export async function requireAdmin(event: any) {
    const session = getSessionFromCookie(event)
    if (!session) {
        throw createError({ statusCode: 401, message: 'No autenticado' })
    }

    const isAdmin = !!session.isAdmin || isAdminEmail(session.email)
    if (!isAdmin) {
        throw createError({ statusCode: 403, message: 'No autorizado' })
    }

    return session
}
