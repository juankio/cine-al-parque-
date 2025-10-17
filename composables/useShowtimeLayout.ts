// /composables/useShowtimeLayout.ts
type SeatState = { code: string; taken: boolean }
type TableRow = { table: string; capacity: number; seats: SeatState[] }
type LayoutRes = { showtimeId: string; tables: TableRow[] }

export function useShowtimeLayout(showtimeId: string) {
    const loading = ref(false)
    const error = ref<string | null>(null)
    const tables = ref<TableRow[]>([])
    const selected = ref<Set<string>>(new Set()) // ej: "M1-A", "M1-B"

    // helpers
    const totalSeats = computed(() => tables.value.reduce((acc, t) => acc + t.seats.length, 0))
    const takenSeats = computed(() =>
        tables.value.reduce((acc, t) => acc + t.seats.filter(s => s.taken).length, 0)
    )
    const freeSeats = computed(() => totalSeats.value - takenSeats.value)
    const selectionList = computed(() => Array.from(selected.value))

    function resetSelection() {
        selected.value.clear()
    }

    function toggleSeat(tableCode: string, seatCode: string, taken: boolean) {
        if (taken) return
        const key = `${tableCode}-${seatCode}`
        const set = selected.value
        if (set.has(key)) set.delete(key)
        else set.add(key)
    }

    async function fetchLayout() {
        loading.value = true
        error.value = null
        try {
            const res = await $fetch<LayoutRes>(`/api/showtimes/${showtimeId}/layout`, { credentials: 'include' })
            tables.value = (res?.tables || []).map(t => ({
                table: t.table,
                capacity: t.capacity,
                seats: t.seats.map(s => ({ code: s.code, taken: !!s.taken }))
            }))
            // limpiar selección si algún seat pasó a taken
            for (const key of Array.from(selected.value)) {
                const [t, s] = key.split('-')
                const tab = tables.value.find(x => x.table === t)
                const nowTaken = tab?.seats.find(x => x.code === s)?.taken
                if (nowTaken) selected.value.delete(key)
            }
        } catch (e: any) {
            error.value = e?.data?.message || e?.message || 'No se pudo cargar el layout'
        } finally {
            loading.value = false
        }
    }

    // POST /api/reservations
    async function createReservation(items?: { menuItemId: string; qty: number }[]) {
        if (selectionList.value.length === 0) throw new Error('Selecciona al menos 1 silla')
        const body: any = {
            showtimeId,
            seats: selectionList.value
        }
        if (items && items.length) body.items = items

        // idempotencia/errores: que el backend devuelva ok/expiresAt etc
        const res = await $fetch<{ ok: boolean; reservation?: { id: string; total: number }; expiresAt?: string }>(
            '/api/reservations',
            { method: 'POST', credentials: 'include', body }
        )
        return res
    }

    // refresco automático cada 10s (para ver holds de otros)
    let timer: any = null
    function startAutoRefresh(ms = 10_000) {
        stopAutoRefresh()
        timer = setInterval(() => fetchLayout(), ms)
    }
    function stopAutoRefresh() {
        if (timer) { clearInterval(timer); timer = null }
    }

    onMounted(fetchLayout)
    onBeforeUnmount(stopAutoRefresh)

    return {
        loading, error, tables, freeSeats, takenSeats, totalSeats,
        selected, selectionList,
        fetchLayout, toggleSeat, resetSelection,
        createReservation,
        startAutoRefresh, stopAutoRefresh
    }
}
