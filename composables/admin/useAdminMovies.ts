export interface AdminMovie {
    _id: string
    titulo: string
    poster?: string
    clasificacion?: string
    duracion?: number
    activo?: boolean
    sinopsis?: string
}

export interface Paged<T> {
    items: T[]
    page: number
    pageSize: number
    total: number
}

export const useAdminMovies = () => {
    const loading = useState<boolean>('admin.movies.loading', () => false)
    const error = useState<string | null>('admin.movies.error', () => null)
    const list = useState<Paged<AdminMovie> | null>('admin.movies.list', () => null)

    async function fetchMovies(page = 1, pageSize = 20, q?: string) {
        loading.value = true; error.value = null
        try {
            const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
            if (q) params.set('q', q)
            const res = await $fetch<Paged<AdminMovie>>(`/api/admin/movies?${params}`, { credentials: 'include' })
            list.value = res
            return res
        } catch (e: any) {
            error.value = e?.data?.message || e?.message || 'No se pudo cargar películas'
            return null
        } finally { loading.value = false }
    }

    async function createMovie(input: Partial<AdminMovie>) {
        const res = await $fetch<{ id: string }>(`/api/admin/movies`, {
            method: 'POST', credentials: 'include', body: input
        })
        return res
    }

    async function updateMovie(id: string, patch: Partial<AdminMovie>) {
        await $fetch(`/api/admin/movies/${id}`, {
            method: 'PATCH', credentials: 'include', body: patch
        })
    }

    async function removeMovie(id: string) {
        await $fetch(`/api/admin/movies/${id}`, { method: 'DELETE', credentials: 'include' })
    }

    return { loading, error, list, fetchMovies, createMovie, updateMovie, removeMovie }
}
