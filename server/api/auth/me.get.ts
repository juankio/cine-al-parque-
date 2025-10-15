import { getSessionFromCookie } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
    const session = getSessionFromCookie(event)
    console.log('[API me] session?', !!session, session?.email)
    if (!session) return { authenticated: false, user: null }
    return {
        authenticated: true,
        user: {
            id: session.sub,
            email: session.email,
            isAdmin: !!session.isAdmin,
            name: session.name,
        },
    }
})
