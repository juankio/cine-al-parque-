export interface ComboItem {
  _id: string
  nombre: string
  precio: number
  categoria?: string
  tags?: string[]
  descripcion?: string
}

type FetchCombosOptions = {
  categoria?: string
  tags?: string[]
  limit?: number
  force?: boolean
  retries?: number
}

const DEFAULT_CACHE_MS = 60_000
const DEFAULT_RETRIES = 2

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const useCombos = () => {
  const combos = useState<ComboItem[]>('combos.items', () => [])
  const loading = useState<boolean>('combos.loading', () => false)
  const error = useState<string | null>('combos.error', () => null)
  const lastFetched = useState<number>('combos.lastFetched', () => 0)
  const controller = useState<AbortController | null>('combos.controller', () => null)

  const fetchCombos = async (options: FetchCombosOptions = {}) => {
    const {
      categoria = '',
      tags = ['combo'],
      limit = 6,
      force = false,
      retries = DEFAULT_RETRIES,
    } = options

    const withinCacheWindow = Date.now() - lastFetched.value < DEFAULT_CACHE_MS
    if (!force && combos.value.length && withinCacheWindow) {
      return combos.value
    }

    if (controller.value) controller.value.abort()
    const abort = new AbortController()
    controller.value = abort

    loading.value = true
    error.value = null

    let attempt = 0
    try {
      while (attempt <= retries) {
        try {
          const query: Record<string, any> = { page: 1, pageSize: Math.max(limit * 2, limit) }
          if (categoria) query.categoria = categoria
          if (tags.length) query.tags = tags.join(',')

          const response = await $fetch<{ items?: ComboItem[] } | ComboItem[]>('/api/menu-items', {
            query,
            credentials: 'include',
            signal: abort.signal,
          })
          const rawItems = Array.isArray(response)
            ? response
            : Array.isArray(response?.items)
              ? response.items
              : []

          const normalizedTags = tags.map(t => t.toLowerCase())
          const filtered = rawItems.filter((item) => {
            const catMatch = categoria
              ? String(item.categoria || '').toLowerCase().includes(categoria.toLowerCase())
              : true
            const tagMatch = normalizedTags.length
              ? (item.tags || []).some(tag => normalizedTags.includes(String(tag).toLowerCase()))
              : true
            return catMatch && tagMatch
          })

          const fallback = filtered.length
            ? filtered
            : rawItems.filter(item => {
              const cat = String(item.categoria || '').toLowerCase()
              const tagSet = new Set((item.tags || []).map(t => String(t).toLowerCase()))
              return cat.includes('combo') || tagSet.has('combo')
            })

          const items = (fallback.length ? fallback : rawItems).slice(0, limit)

          combos.value = items
          lastFetched.value = Date.now()
          error.value = null
          return combos.value
        } catch (err: any) {
          if (abort.signal.aborted) throw err
          attempt += 1
          if (attempt > retries) {
            error.value = err?.data?.message || err?.message || 'No pudimos cargar los combos'
            break
          }
          await wait(450 * attempt)
        }
      }
      console.log(combos.value)

      return combos.value
    } finally {
      loading.value = false
    }
  }

  const refresh = (options?: FetchCombosOptions) => fetchCombos({ force: true, ...(options || {}) })

  return {
    combos,
    loading,
    error,
    fetchCombos,
    refresh,
  }
}
