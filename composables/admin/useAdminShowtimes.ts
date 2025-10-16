export interface AdminShowtime {
    _id: string
    movieId: string
    fechaHora?: string
    sala?: string
    price?: number
}

export const useAdminShowtimes = () => {
    const loading = useState<boolean>('admin.st.loading', () => false)
    const error = useState<string | null>('admin.st.error', () => null)
    const list = useState<AdminShowtime[]>('admin.st.list', () => [])

    async function fetchShowtimes(movieId?: string) {
        loading.value = true; error.value = null
        try {
            if (movieId && movieId.trim()) {
                const res = await $fetch<AdminShowtime[]>(
                    `/api/admin/showtimes?movieId=${movieId}`, { credentials: 'include' }
                )
                list.value = Array.isArray(res) ? res : []
            } else {
                list.value = []
            }
            return list.value
        } catch (e: any) {
            error.value = e?.data?.message || e?.message || 'No se pudieron cargar funciones'
            list.value = []
            return null
        } finally {
            loading.value = false
        }
    }

    async function createShowtime(input: Omit<AdminShowtime, '_id'>) {
        return $fetch<{ id: string }>(`/api/admin/showtimes`, {
            method: 'POST', credentials: 'include', body: input
        })
    }
    async function updateShowtime(id: string, patch: Partial<AdminShowtime>) {
        await $fetch(`/api/admin/showtimes/${id}`, {
            method: 'PATCH', credentials: 'include', body: patch
        })
    }
    async function removeShowtime(id: string) {
        await $fetch(`/api/admin/showtimes/${id}`, {
            method: 'DELETE', credentials: 'include'
        })
    }
    async function generateLayout(showtimeId: string) {
        await $fetch(`/api/admin/showtimes/${showtimeId}/layout/generate`, {
            method: 'POST', credentials: 'include', body: { replace: true }
        })
    }

    return { loading, error, list, fetchShowtimes, createShowtime, updateShowtime, removeShowtime, generateLayout }
}
