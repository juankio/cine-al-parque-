// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
    // sólo protegemos estas rutas (ajusta si quieres más)
    const protectedPrefixes = ['/me', '/admin']
    if (!protectedPrefixes.some(p => to.path.startsWith(p))) return

    const { user } = useAuth()

    // si ya tenemos user en memoria, ok
    if (user.value) return

    try {
        // valida sesión con cookie (HttpOnly) primero
        const me = await $fetch<{ authenticated: boolean; user: any }>('/api/auth/me', {
            credentials: 'include'
        })

        if (me?.authenticated && me?.user) {
            // hidrata el estado global de auth
            user.value = me.user
            return
        }
    } catch (_) {
        // ignoramos el error; abajo redirigimos
    }

    // redirige a login con redirect seguro
    const redirect = encodeURIComponent(to.fullPath)
    return navigateTo(`/login?redirect=${redirect}`)
})
