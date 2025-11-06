export interface PublicShowtime {
  _id: string
  movieId: string
  titulo: string
  fechaHora: string
  poster?: string
  sala?: string | number
  price?: number
  active?: boolean
}

type ListResp = { items?: PublicShowtime[] } | PublicShowtime[]

type FetchUpcomingOptions = {
  hours?: number
  limit?: number
  silent?: boolean
  onlyOnChange?: boolean
  force?: boolean
  retries?: number
}

const DEFAULT_CACHE_MS = 60_000
const DEFAULT_RETRIES = 2

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const useShowtimes = () => {
  const loading = useState<boolean>('st.loading', () => false)
  const error = useState<string | null>('st.error', () => null)
  const list = useState<PublicShowtime[]>('st.list', () => [])
  const lastFetched = useState<number>('st.lastFetched', () => 0)
  const pending = useState<boolean>('st.pending', () => false)

  const timer = useState<ReturnType<typeof setInterval> | null>('st.timer', () => null)

  function normalize(resp: ListResp): PublicShowtime[] {
    if (Array.isArray(resp)) return resp
    if (resp && Array.isArray((resp as any).items)) return (resp as any).items
    return []
  }

  function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  }

  function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  }

  function sameShowtime(a: PublicShowtime, b: PublicShowtime) {
    return (
      a._id === b._id &&
      a.fechaHora === b.fechaHora &&
      (a.sala ?? '') === (b.sala ?? '') &&
      (a.price ?? 0) === (b.price ?? 0) &&
      (a.poster ?? '') === (b.poster ?? '') &&
      (a.titulo ?? '') === (b.titulo ?? '')
    )
  }

  function hasChanges(prev: PublicShowtime[], next: PublicShowtime[]) {
    if (prev.length !== next.length) return true
    for (let i = 0; i < prev.length; i++) {
      if (!sameShowtime(prev[i], next[i])) return true
    }
    return false
  }

  async function fetchUpcoming(options: FetchUpcomingOptions = {}) {
    const {
      hours = 24,
      limit = 12,
      silent = false,
      onlyOnChange = false,
      force = false,
      retries = DEFAULT_RETRIES,
    } = options

    const useSilent = silent && list.value.length > 0
    if (!useSilent) {
      loading.value = true
      error.value = null
    } else {
      error.value = null
    }

    const withinCache = !force && list.value.length && Date.now() - lastFetched.value < DEFAULT_CACHE_MS
    if (withinCache) {
      if (!useSilent) loading.value = false
      return list.value
    }

    if (pending.value) {
      if (!useSilent) loading.value = false
      return list.value
    }

    pending.value = true

    try {
      let attempt = 0
      while (attempt <= retries) {
        try {
          const resp = await $fetch<ListResp>('/api/showtimes', {
            query: { upcoming: 1, hours, limit },
            credentials: 'include',
          })
          const nextList = normalize(resp)
          if (!onlyOnChange || hasChanges(list.value, nextList)) {
            list.value = nextList
            lastFetched.value = Date.now()
          }
          error.value = null
          return list.value
        } catch (e: any) {
          attempt += 1
          const message = e?.data?.message || e?.message || 'No se pudieron cargar las funciones'
          error.value = message
          if (attempt > retries) {
            break
          }
          await wait(450 * attempt)
        }
      }
      return list.value
    } finally {
      pending.value = false
      if (!useSilent) loading.value = false
    }
  }

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

  const today = computed(() => {
    const todayRef = startOfDay(new Date())
    return list.value.filter(s => isSameDay(new Date(s.fechaHora), todayRef))
  })

  const tomorrow = computed(() => {
    const tomorrowRef = startOfDay(new Date())
    tomorrowRef.setDate(tomorrowRef.getDate() + 1)
    return list.value.filter(s => isSameDay(new Date(s.fechaHora), tomorrowRef))
  })

  const byHour = computed(() => {
    const map = new Map<string, PublicShowtime[]>()
    for (const s of list.value) {
      const hh = new Date(s.fechaHora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      if (!map.has(hh)) map.set(hh, [])
      map.get(hh)!.push(s)
    }
    return map
  })

  function startAutoRefresh(options: FetchUpcomingOptions & { intervalMs?: number } = {}) {
    const {
      intervalMs = 15_000,
      hours = 24,
      limit = 12,
      silent = true,
      onlyOnChange = true,
    } = options
    stopAutoRefresh()
    timer.value = setInterval(() => {
      fetchUpcoming({ hours, limit, silent, onlyOnChange, force: true }).catch(() => {})
    }, intervalMs)
  }

  function stopAutoRefresh() {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
  }

  const attachFocusRefresh = () => {
    const focusAttached = useState<boolean>('st.focusAttached', () => false)
    if (!process.client || focusAttached.value) return
    const handler = () => {
      if (document.hidden) return
      fetchUpcoming({ silent: true, onlyOnChange: true, force: true }).catch(() => {})
    }
    window.addEventListener('visibilitychange', handler)
    window.addEventListener('focus', handler)
    focusAttached.value = true
  }

  attachFocusRefresh()

  return {
    loading,
    error,
    list,
    today,
    tomorrow,
    byHour,
    fetchUpcoming,
    fetchRange,
    startAutoRefresh,
    stopAutoRefresh,
  }
}
