import { getSessionFromCookie } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
    const session = getSessionFromCookie(event)
    if (!session) {
        return { authenticated: false, user: null }
    }

    // Opcional: refrescar datos desde DB si necesitas algo más fresco:
    // const user = await UserModel.findById(session.sub).lean()
    // if (!user) return { authenticated: false, user: null }

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
