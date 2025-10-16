// /composables/useMe.ts

// ---- Tipos que usa la vista ----
export type ReservationStatus = 'pending' | 'paid' | 'expired' | 'canceled'

export interface HistoryItem {
    id: string
    status: ReservationStatus
    total: number
    createdAt?: string
    expiresAt?: string | null
    seats: string[]
    showtime: {
        id: string
        fechaHora: string
        sala: string
        price: number
    }
    movie: {
        id: string
        titulo: string
        poster?: string
        clasificacion?: string
        duracion?: number
    }
    cart?: Array<{ nombre: string; qty: number; unitPrice: number; menuItemId: string }>
}

export interface HistoryResponse {
    items: HistoryItem[]
    page: number
    pageSize: number
    total: number
}

export type HistoryFilters = {
    page?: number
    pageSize?: number
    status?: ReservationStatus
    from?: string
    to?: string
    upcoming?: 'true' | 'false'
}

// Stats según tu backend real
export interface MeStats {
    visits: number
    totalSpent: number
    lastVisit?: string | null
    favorite?: {
        count: number
        movieId: string
        titulo: string
        poster?: string
    } | null
}

// ---- Composable ----
export const useMe = () => {
    // estados
    const loading = useState<boolean>('me.loading', () => false)
    const stats = useState<MeStats | null>('me.stats', () => null)
    // ⚠️ NO la llames "history" internamente para no confundirse con window.history
    const historyState = useState<HistoryResponse | null>('me.history', () => null)
    const error = useState<any>('me.error', () => null)

    // GET /api/me/stats (con reintento si 401)
    const fetchStats = async (): Promise<MeStats | null> => {
        loading.value = true
        error.value = null
        try {
            const res = await $fetch<MeStats>('/api/me/stats', { credentials: 'include' })
            stats.value = res
            return res
        } catch (e: any) {
            const status = e?.response?.status || e?.statusCode
            if (status === 401) {
                // Revalida sesión y reintenta 1 vez
                try {
                    const { ensureSession, user } = useAuth()
                    await ensureSession()
                    if (user.value) {
                        const res2 = await $fetch<MeStats>('/api/me/stats', { credentials: 'include' })
                        stats.value = res2
                        return res2
                    }
                } catch { }
            }
            error.value = e?.data?.message || e?.message || 'No se pudieron cargar tus métricas'
            return null
        } finally {
            loading.value = false
        }
    }

    // GET /api/me/history (con filtros)
    const fetchHistory = async (filters: HistoryFilters = {}): Promise<HistoryResponse | null> => {
        loading.value = true
        error.value = null
        try {
            const qs = new URLSearchParams()
            if (filters.page) qs.set('page', String(filters.page))
            if (filters.pageSize) qs.set('pageSize', String(filters.pageSize))
            if (filters.status) qs.set('status', filters.status)
            if (filters.from) qs.set('from', filters.from)
            if (filters.to) qs.set('to', filters.to)
            if (filters.upcoming) qs.set('upcoming', filters.upcoming)

            const url = '/api/me/history' + (qs.toString() ? `?${qs.toString()}` : '')
            const res = await $fetch<HistoryResponse>(url, { credentials: 'include' })
            historyState.value = res
            return res
        } catch (e: any) {
            const status = e?.response?.status || e?.statusCode
            if (status === 401) {
                try {
                    const { ensureSession, user } = useAuth()
                    await ensureSession()
                    if (user.value) {
                        const qs = new URLSearchParams()
                        if (filters.page) qs.set('page', String(filters.page))
                        if (filters.pageSize) qs.set('pageSize', String(filters.pageSize))
                        if (filters.status) qs.set('status', filters.status!)
                        if (filters.from) qs.set('from', filters.from!)
                        if (filters.to) qs.set('to', filters.to!)
                        if (filters.upcoming) qs.set('upcoming', filters.upcoming!)
                        const url = '/api/me/history' + (qs.toString() ? `?${qs.toString()}` : '')
                        const res2 = await $fetch<HistoryResponse>(url, { credentials: 'include' })
                        historyState.value = res2
                        return res2
                    }
                } catch { }
            }
            error.value = e?.data?.message || e?.message || 'No se pudo cargar tu historial'
            return null
        } finally {
            loading.value = false
        }
    }

    // lo que exponemos (nota: exponemos como "history" pero internamente es historyState)
    return { loading, stats, history: historyState, error, fetchStats, fetchHistory }
}
