import { getCookie } from 'h3'
import jwt from 'jsonwebtoken'

const COOKIE_NAME = 'session'

type Sess = { id: string, email: string, isAdmin?: boolean, name?: string }

export async function readSession(event: any): Promise<Sess | null> {
    const token = getCookie(event, COOKIE_NAME)
    if (!token) return null
    const { authSecret } = useRuntimeConfig()
    try {
        const payload = jwt.verify(token, authSecret) as any
        return {
            id: String(payload.sub),
            email: String(payload.email),
            isAdmin: !!payload.isAdmin,
            name: payload.name ? String(payload.name) : undefined
        }
    } catch {
        return null
    }
}
