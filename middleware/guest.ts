export default defineNuxtRouteMiddleware(async (to) => {
  const { initialize, isAuthenticated } = useAuth()
  await initialize()

  if (isAuthenticated.value) {
    const redirectQuery = to.query.redirect
    let target = '/'
    if (typeof redirectQuery === 'string' && redirectQuery.startsWith('/')) {
      target = redirectQuery
    }

    if (target === to.fullPath) {
      target = '/'
    }

    return navigateTo(target)
  }
})
