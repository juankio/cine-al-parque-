export default defineNuxtRouteMiddleware(async (to) => {
    // Solo protege rutas que lo pidan explícitamente
    // en la página: definePageMeta({ auth: true })
    if (to.meta?.auth !== true) return

    const { user, fetchMe } = useAuth()

    // Si no tenemos usuario en memoria, intentamos cargar la sesión
    if (!user.value) {
        await fetchMe()
    }

    // Si sigue sin usuario → redirige a /login con ?redirect
    if (!user.value) {
        const redirect = encodeURIComponent(to.fullPath)
        return navigateTo({ path: '/login', query: { redirect } })
    }
})
