export default defineNuxtPlugin(() => {
    if (process.server) return

    const originalFetch: any = (globalThis as any).$fetch

        ; (globalThis as any).$fetch = async (request: any, opts: any = {}) => {
            try {
                return await originalFetch(request, { credentials: 'include', ...opts })
            } catch (err: any) {
                const status = err?.status ?? err?.response?.status
                if (status === 401) {
                    const route = useRoute()
                    navigateTo({ path: '/login', query: { redirect: route.fullPath } })
                }
                throw err
            }
        }
})
