// /composables/admin/useAdminShowtimes.ts
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
}

type CreateInput = { movieId: string; fechaHora: string; sala: string; price: number }
type CreateRes = { ok: true; showtime: AdminShowtime }

export const useAdminShowtimes = () => {
    const loading = useState<boolean>('admin.st.loading', () => false)
    const error = useState<string | null>('admin.st.error', () => null)
    const list = useState<AdminShowtime[]>('admin.st.list', () => [])

    async function fetchShowtimes(movieId: string, opts: FetchOpts = {}) {
        loading.value = true
        error.value = null
        try {
            const params = new URLSearchParams()
            if (movieId?.trim()) params.set('movieId', movieId.trim())
            params.set('page', String(opts.page ?? 1))
            params.set('pageSize', String(opts.pageSize ?? 50))
            params.set('upcoming', 'true') // 👈 solo funciones futuras

            const url = `/api/admin/showtimes?${params.toString()}`
            console.log('[admin.st] GET', url)
            const res: any = await $fetch(url, { credentials: 'include' })

            const items = Array.isArray(res) ? res : (Array.isArray(res?.items) ? res.items : [])
            list.value = items
            return list.value
        } catch (e: any) {
            console.error('[admin.st] ERR', e)
            error.value = e?.data?.message || e?.message || 'No se pudieron cargar funciones'
            list.value = []
            return null
        } finally {
            loading.value = false
        }
    }


    // crea y mete el showtime en memoria (ordenado por fecha)
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
        await $fetch(`/api/admin/showtimes/${id}`, {
            method: 'DELETE', credentials: 'include'
        })
        list.value = list.value.filter(s => s._id !== id)
    }

    async function generateLayout(showtimeId: string) {
        await $fetch(`/api/admin/showtimes/${showtimeId}/layout/generate`, {
            method: 'POST', credentials: 'include', body: { replace: true }
        })
    }

    return { loading, error, list, fetchShowtimes, createShowtime, removeShowtime, generateLayout }
}
