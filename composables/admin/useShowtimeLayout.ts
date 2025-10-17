// /composables/useShowtimeLayout.ts
type SeatState = { code: string; taken: boolean }
type TableRow = { table: string; capacity: number; seats: SeatState[] }
type LayoutRes = { showtimeId: string; tables: TableRow[] }

export function useShowtimeLayout(idRef: Ref<string>) {
    const loading = ref(false)
    const error = ref<string | null>(null)
    const tables = ref<TableRow[]>([])
    const selected = ref<Set<string>>(new Set())

    const totalSeats = computed(() => tables.value.reduce((a, t) => a + t.seats.length, 0))
    const takenSeats = computed(() => tables.value.reduce((a, t) => a + t.seats.filter(s => s.taken).length, 0))
    const freeSeats = computed(() => totalSeats.value - takenSeats.value)
    const selectionList = computed(() => Array.from(selected.value))

    function resetSelection() { selected.value.clear() }
    function toggleSeat(tableCode: string, seatCode: string, taken: boolean) {
        if (taken) return
        const k = `${tableCode}-${seatCode}`
        selected.value.has(k) ? selected.value.delete(k) : selected.value.add(k)
    }

    async function fetchLayout() {
        const showtimeId = (idRef.value || '').trim()
        if (!showtimeId) return

        loading.value = true
        error.value = null
        try {
            // ⚠️ Usa availability (tu handler público correcto)
            const res = await $fetch<LayoutRes>(`/api/showtimes/${showtimeId}/availability`, {
                credentials: 'include'
            })
            console.log('[layout][OK]', showtimeId, res)

            const arr = Array.isArray(res?.tables) ? res.tables : []
            tables.value = arr.map(t => ({
                table: t.table,
                capacity: t.capacity,
                seats: (t.seats || []).map(s => ({ code: s.code, taken: !!s.taken }))
            }))

            // Si algo que estaba seleccionado pasó a taken, límpialo
            for (const k of Array.from(selected.value)) {
                const [tb, sc] = k.split('-')
                const nowTaken = tables.value.find(x => x.table === tb)?.seats.find(x => x.code === sc)?.taken
                if (nowTaken) selected.value.delete(k)
            }
        } catch (e: any) {
            console.warn('[layout][ERR]', e)
            error.value = e?.data?.message || e?.message || 'No se pudo cargar el layout'
            tables.value = []
        } finally {
            loading.value = false
        }
    }

    let timer: any = null
    function startAutoRefresh(ms = 10_000) { stopAutoRefresh(); timer = setInterval(fetchLayout, ms) }
    function stopAutoRefresh() { if (timer) { clearInterval(timer); timer = null } }

    // 🔁 Dispara cuando el id esté listo/cambie
    watch(idRef, (v) => { if (v) fetchLayout() }, { immediate: true })
    onBeforeUnmount(stopAutoRefresh)

    return {
        loading, error, tables, totalSeats, takenSeats, freeSeats,
        selected, selectionList,
        fetchLayout, toggleSeat, resetSelection,
        startAutoRefresh, stopAutoRefresh
    }
}
