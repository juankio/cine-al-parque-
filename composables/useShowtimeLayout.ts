// /composables/useShowtimeLayout.ts
type SeatState = { code: string; taken: boolean }
type TableRow = { table: string; capacity: number; seats: SeatState[] }
type LayoutRes = { showtimeId: string; tables: TableRow[] }

export function useShowtimeLayout(idRef: Ref<string>) {
    const loading = ref(false)
    const error = ref<string | null>(null)
    const tables = ref<TableRow[]>([])
    const selected = ref<Set<string>>(new Set()) // ej: "M1-A"

    // métricas
    const totalSeats = computed(() => tables.value.reduce((acc, t) => acc + t.seats.length, 0))
    const takenSeats = computed(() => tables.value.reduce((acc, t) => acc + t.seats.filter(s => s.taken).length, 0))
    const freeSeats = computed(() => totalSeats.value - takenSeats.value)
    const selectionList = computed(() => Array.from(selected.value))

    function resetSelection() { selected.value.clear() }
    function toggleSeat(tableCode: string, seatCode: string, taken: boolean) {
        if (taken) return
        const k = `${tableCode}-${seatCode}`
        const set = selected.value
        set.has(k) ? set.delete(k) : set.add(k)
    }

    async function fetchLayout(options?: { silent?: boolean }) {
        const showtimeId = idRef.value?.trim()
        if (!showtimeId) return

        const silent = !!options?.silent
        if (!silent) loading.value = true
        error.value = null
        try {
            const res = await $fetch<LayoutRes>(`/api/showtimes/${showtimeId}/availability`, {
                credentials: 'include'
            })
            const arr = Array.isArray(res?.tables) ? res.tables : []
            tables.value = arr.map(t => ({
                table: t.table,
                capacity: t.capacity,
                seats: (t.seats || []).map(s => ({ code: s.code, taken: !!s.taken }))
            }))

            for (const key of Array.from(selected.value)) {
                const [tb, sc] = key.split('-')
                const nowTaken = tables.value.find(x => x.table === tb)?.seats.find(x => x.code === sc)?.taken
                if (nowTaken) selected.value.delete(key)
            }
        } catch (e: any) {
            console.error('[layout] error', e)
            error.value = e?.data?.message || e?.message || 'No se pudo cargar el layout'
            tables.value = []
        } finally {
            if (!silent) loading.value = false
        }
    }

    watch(idRef, (v) => {
        if (v) fetchLayout()
    }, { immediate: true })

    return {
        loading, error, tables, totalSeats, takenSeats, freeSeats,
        selected, selectionList,
        fetchLayout, toggleSeat, resetSelection
    }
}
