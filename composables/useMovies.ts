// /composables/useMovies.ts
export interface Movie {
    id: string
    titulo: string
    poster?: string
    clasificacion?: string
    duracion?: number
    sinopsis?: string
}

export interface Showtime {
    id: string
    fechaHora: string // ISO
    sala: string
    price: number
}

type MoviesResponse = Movie[]

export const useMovies = () => {
    const loading = useState<boolean>('movies.loading', () => false)
    const error = useState<string | null>('movies.error', () => null)
    const movies = useState<Movie[]>('movies.list', () => [])
    // cache de showtimes por película
    const showtimesMap = useState<Record<string, Showtime[]>>('movies.showtimes', () => ({}))

    const fetchMovies = async (): Promise<Movie[]> => {
        loading.value = true
        error.value = null
        try {
            const res = await $fetch<MoviesResponse>('/api/movies', { credentials: 'include' })
            movies.value = Array.isArray(res) ? res : []
            return movies.value
        } catch (e: any) {
            error.value = e?.data?.message || e?.message || 'No se pudo cargar la cartelera'
            return []
        } finally {
            loading.value = false
        }
    }

    const fetchShowtimes = async (movieId: string): Promise<Showtime[]> => {
        if (!movieId) return []
        try {
            const res = await $fetch<Showtime[]>(`/api/movies/${movieId}/showtimes`, { credentials: 'include' })
            // guardamos ordenados por fecha
            const sorted = (res || []).slice().sort((a, b) => +new Date(a.fechaHora) - +new Date(b.fechaHora))
            showtimesMap.value = { ...showtimesMap.value, [movieId]: sorted }
            return sorted
        } catch {
            showtimesMap.value = { ...showtimesMap.value, [movieId]: [] }
            return []
        }
    }

    // helpers
    const upcomingShowtimes = (movieId: string, limit = 3): Showtime[] => {
        const now = Date.now()
        const all = showtimesMap.value[movieId] || []
        return all.filter(s => +new Date(s.fechaHora) >= now).slice(0, limit)
    }

    return { loading, error, movies, showtimesMap, fetchMovies, fetchShowtimes, upcomingShowtimes }
}
