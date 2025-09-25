export default defineNuxtRouteMiddleware(async (to) => {
  const { initialize, isAuthenticated } = useAuth()
  await initialize()

  if (!isAuthenticated.value) {
    const redirectParam = encodeURIComponent(to.fullPath)
    return navigateTo(`/login?redirect=${redirectParam}`)
  }
})
