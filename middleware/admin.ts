export default defineNuxtRouteMiddleware(async (to) => {
    if (process.server) return
    // Solo rutas /admin
    if (!to.path.startsWith('/admin')) return

    const { user, ensureSession } = useAuth()

    // Ya cargado y no admin → fuera
    if (user.value && !user.value.isAdmin) {
        return navigateTo('/')
    }

    // Si no hay user, asegúralo
    if (!user.value) {
        await ensureSession()
        if (!user.value) return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
        if (!user.value.isAdmin) return navigateTo('/')
    }
})
