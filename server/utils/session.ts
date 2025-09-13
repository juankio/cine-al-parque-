import { SignJWT, jwtVerify } from 'jose'
import type { H3Event } from 'h3'

const COOKIE_NAME = 'cine_session'
const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 días
}

function getSecretKey() {
    const { authSecret } = useRuntimeConfig()
    if (!authSecret) throw new Error('Falta AUTH_SECRET')
    return new TextEncoder().encode(authSecret)
}

export async function createSession(event: H3Event, payload: { id: string, name: string, email: string }) {
    const key = getSecretKey()
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(key)
    setCookie(event, COOKIE_NAME, token, COOKIE_OPTIONS)
}

export function clearSession(event: H3Event) {
    deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export async function readSession(event: H3Event) {
    const token = getCookie(event, COOKIE_NAME)
    if (!token) return null
    try {
        const { payload } = await jwtVerify(token, getSecretKey())
        return payload as any
    } catch {
        return null
    }
}
