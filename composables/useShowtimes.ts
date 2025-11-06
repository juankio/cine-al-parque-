// /composables/useShowtimes.ts
export interface PublicShowtime {
    _id: string
    movieId: string
    titulo: string
    fechaHora: string   // ISO en UTC (modelo Showtime)
    poster?: string
    sala?: string | number
    price?: number
    active?: boolean
}

type ListResp = { items?: PublicShowtime[] } | PublicShowtime[]

export const useShowtimes = () => {
    // cache global (reactivo entre páginas)
    const loading = useState<boolean>('st.loading', () => false)
    const error = useState<string | null>('st.error', () => null)
    const list = useState<PublicShowtime[]>('st.list', () => [])

    // id del timer de autorefresco
    const timer = useState<ReturnType<typeof setInterval> | null>('st.timer', () => null)

    /** Normaliza respuestas: array plano o { items: [] } */
    function normalize(resp: ListResp): PublicShowtime[] {
        if (Array.isArray(resp)) return resp
        if (resp && Array.isArray((resp as any).items)) return (resp as any).items
        return []
    }

    function startOfDay(date: Date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate())
    }

    function isSameDay(a: Date, b: Date) {
        return a.getFullYear() === b.getFullYear()
            && a.getMonth() === b.getMonth()
            && a.getDate() === b.getDate()
    }

    /** Próximos showtimes (ej: próximas 24h). */
    async function fetchUpcoming(hours = 24, limit = 12) {
        loading.value = true
        error.value = null
        try {
            const resp = await $fetch<ListResp>('/api/showtimes', {
                query: { upcoming: 1, hours, limit },
                credentials: 'include',
            })
            list.value = normalize(resp)
        } catch (e: any) {
            error.value = e?.data?.message || e?.message || 'No se pudieron cargar las funciones'
            list.value = []
        } finally {
            loading.value = false
        }
        return list.value
    }

    /** Por rango de fechas (ISO, UTC). */
    async function fetchRange(fromISO: string, toISO: string, limit = 100) {
        loading.value = true
        error.value = null
        try {
            const resp = await $fetch<ListResp>('/api/showtimes', {
                query: { from: fromISO, to: toISO, limit },
                credentials: 'include',
            })
            list.value = normalize(resp)
        } catch (e: any) {
            error.value = e?.data?.message || e?.message || 'No se pudieron cargar las funciones'
            list.value = []
        } finally {
            loading.value = false
        }
        return list.value
    }

    /** Funciones de hoy (horario local). */
    const today = computed(() => {
        const todayRef = startOfDay(new Date())
        return list.value.filter(s => {
            const date = new Date(s.fechaHora)
            return isSameDay(date, todayRef)
        })
    })

    /** Funciones de mañana (horario local). */
    const tomorrow = computed(() => {
        const tomorrowRef = startOfDay(new Date())
        tomorrowRef.setDate(tomorrowRef.getDate() + 1)
        return list.value.filter(s => {
            const date = new Date(s.fechaHora)
            return isSameDay(date, tomorrowRef)
        })
    })

    /** Agrupa por hora (HH:mm) útil para chips/etiquetas. */
    const byHour = computed(() => {
        const map = new Map<string, PublicShowtime[]>()
        for (const s of list.value) {
            const hh = new Date(s.fechaHora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
            if (!map.has(hh)) map.set(hh, [])
            map.get(hh)!.push(s)
        }
        return map
    })

    /** Inicia autorefresco (ms). */
    function startAutoRefresh(intervalMs = 15000, hours = 24, limit = 12) {
        stopAutoRefresh()
        timer.value = setInterval(() => { fetchUpcoming(hours, limit) }, intervalMs)
    }
    /** Detiene autorefresco. */
    function stopAutoRefresh() {
        if (timer.value) {
            clearInterval(timer.value)
            timer.value = null
        }
    }

    return {
        // state
        loading, error, list, today, tomorrow, byHour,
        // fetchers
        fetchUpcoming, fetchRange,
        // refresh
        startAutoRefresh, stopAutoRefresh,
    }
}
