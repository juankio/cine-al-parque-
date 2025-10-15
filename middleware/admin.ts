export default defineNuxtRouteMiddleware(async (to) => {
    const { user, fetchMe } = useAuth()

    // Cargamos usuario si no hay sesión en memoria
    if (!user.value) {
        await fetchMe()
    }

    // Si no hay usuario o no es admin → afuera
    if (!user.value || !user.value.isAdmin) {
        console.warn(`[auth] acceso denegado a ruta admin: ${to.fullPath}`)
        return navigateTo('/')
    }
})
