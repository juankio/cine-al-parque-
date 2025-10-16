export default defineNuxtRouteMiddleware(async (to) => {
    // Rutas protegidas
    const protectedPrefixes = ['/me', '/admin']
    if (!protectedPrefixes.some(p => to.path.startsWith(p))) return

    // Solo en cliente
    if (process.server) return

    const { user, ensureSession } = useAuth()

    // Si ya tenemos user en memoria, seguimos
    if (user.value) return

    // Asegura una sola llamada a /me en este ciclo
    await ensureSession()

    // Si después de asegurar seguimos sin user → a login con redirect
    if (!user.value) {
        const redirect = encodeURIComponent(to.fullPath)
        return navigateTo(`/login?redirect=${redirect}`)
    }
})
