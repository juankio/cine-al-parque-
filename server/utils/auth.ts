import jwt from 'jsonwebtoken'
import { H3Event, getCookie, setCookie, deleteCookie } from 'h3'

export const COOKIE_NAME = 'session'
const ONE_DAY = 60 * 60 * 24
const THIRTY_DAYS = ONE_DAY * 30

export interface SessionPayload {
    sub: string
    email: string
    isAdmin?: boolean
    name?: string
}

function getSecret(): string {
    const { authSecret } = useRuntimeConfig()
    if (!authSecret) throw new Error('Missing authSecret in runtimeConfig')
    return authSecret
}

export function signToken(payload: SessionPayload, expiresInSec: number) {
    return jwt.sign(payload, getSecret(), { algorithm: 'HS256', expiresIn: expiresInSec })
}

export function verifyToken(token: string): SessionPayload | null {
    try {
        return jwt.verify(token, getSecret()) as SessionPayload
    } catch {
        return null
    }
}

export function setSessionCookie(event: H3Event, token: string, maxAgeSec: number) {
    const isProd = process.env.NODE_ENV === 'production'
    setCookie(event, COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,          // en dev queda false
        path: '/',
        maxAge: maxAgeSec,
    })
}

export function clearSessionCookie(event: H3Event) {
    deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function getSessionFromCookie(event: H3Event): SessionPayload | null {
    const token = getCookie(event, COOKIE_NAME)
    if (!token) return null
    return verifyToken(token)
}

export function createSession(event: H3Event, payload: SessionPayload, remember = false) {
    const maxAge = remember ? THIRTY_DAYS : ONE_DAY
    const token = signToken(payload, maxAge)
    setSessionCookie(event, token, maxAge)
    return { token, maxAge }
}
