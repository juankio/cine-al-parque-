export interface AdminShowtime {
    _id: string
    movieId: string
    fechaHora: string
    sala: string
    price: number
}

export interface FetchOpts {
    page?: number
    pageSize?: number
    upcoming?: boolean
}

type CreateInput = { movieId: string; fechaHora: string; sala: string; price: number }
type CreateRes = { ok: true; showtime: AdminShowtime }

export const useAdminShowtimes = () => {
    const loading = useState<boolean>('admin.st.loading', () => false)
    const error = useState<string | null>('admin.st.error', () => null)
    const list = useState<AdminShowtime[]>('admin.st.list', () => [])

    async function fetchShowtimes(movieId: string, opts: FetchOpts = {}) {
        loading.value = true; error.value = null
        try {
            const params = new URLSearchParams()
            if (movieId?.trim()) params.set('movieId', movieId.trim())
            params.set('page', String(opts.page ?? 1))
            params.set('pageSize', String(opts.pageSize ?? 50))
            if (opts.upcoming !== undefined) params.set('upcoming', String(opts.upcoming)) // true|false

            const url = `/api/admin/showtimes?${params.toString()}`
            const res: any = await $fetch(url, { credentials: 'include' })

            const items: AdminShowtime[] = Array.isArray(res) ? res : (Array.isArray(res?.items) ? res.items : [])
            // por si el backend viniera desordenado
            list.value = items.sort((a, b) => +new Date(a.fechaHora) - +new Date(b.fechaHora))
            return list.value
        } catch (e: any) {
            error.value = e?.data?.message || e?.message || 'No se pudieron cargar funciones'
            list.value = []
            return null
        } finally {
            loading.value = false
        }
    }

    async function createShowtime(input: CreateInput) {
        const res = await $fetch<CreateRes>('/api/admin/showtimes', {
            method: 'POST', credentials: 'include', body: input
        })
        if (res?.ok && res.showtime) {
            const next = [...list.value, res.showtime]
            next.sort((a, b) => +new Date(a.fechaHora) - +new Date(b.fechaHora))
            list.value = next
            return res.showtime
        }
        return null
    }

    async function removeShowtime(id: string) {
        await $fetch(`/api/admin/showtimes/${id}`, { method: 'DELETE', credentials: 'include' })
        list.value = list.value.filter(s => s._id !== id)
    }

    async function generateLayout(showtimeId: string) {
        await $fetch(`/api/admin/showtimes/${showtimeId}/layout/generate`, {
            method: 'POST', credentials: 'include', body: { replace: true }
        })
    }

    return { loading, error, list, fetchShowtimes, createShowtime, removeShowtime, generateLayout }
}
