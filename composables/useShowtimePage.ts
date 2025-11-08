import { ref, computed, watch, onMounted, onBeforeUnmount, reactive } from 'vue'
import { useRoute, useToast } from '#imports'
import { useShowtimeLayout } from '~/composables/useShowtimeLayout'
import { useAuth } from '~/composables/useAuth'
import { useCombos } from '~/composables/useCombos'
import type { ComboItem } from '~/composables/useCombos'
import type { ShowtimeInfo, CartLine, ReservationSnapshot, LayoutStat } from '~/types/showtime'

export const useShowtimePage = () => {
    const toast = useToast()
    const route = useRoute()
    const { user, ensureSession } = useAuth()

    const showtimeId = computed(() => String(route.params.id || ''))

    const showtime = ref<ShowtimeInfo | null>(null)
    const showtimeLoading = ref(false)
    const showtimeError = ref<string | null>(null)

    async function fetchShowtimeDetails() {
        const id = showtimeId.value
        if (!id) return
        showtimeLoading.value = true
        showtimeError.value = null
        try {
            const data = await $fetch<ShowtimeInfo>(`/api/showtimes/${id}`, { credentials: 'include' })
            showtime.value = data
        } catch (e: any) {
            showtimeError.value = e?.data?.message || e?.message || 'No se pudo cargar la función'
            showtime.value = null
        } finally {
            showtimeLoading.value = false
        }
    }

    watch(showtimeId, () => {
        if (showtimeId.value) fetchShowtimeDetails()
    }, { immediate: true })

    const {
        loading: layoutLoading,
        error: layoutError,
        tables,
        totalSeats,
        takenSeats,
        freeSeats,
        selected,
        selectionList,
        fetchLayout,
        toggleSeat,
        resetSelection
    } = useShowtimeLayout(showtimeId)

    const reserveMode = ref(false)
    const reserving = ref(false)
    const confirming = ref(false)
    const autoRefTS = ref<number | null>(null)
    const lastRefreshedAt = ref<string | null>(null)
    const lastHold = ref<ReservationSnapshot | null>(null)
    const holdCountdown = ref<string | null>(null)
    const holdTimer = ref<ReturnType<typeof setInterval> | null>(null)

    const {
        combos,
        loading: combosLoading,
        error: combosError,
        fetchCombos,
        refresh: refreshCombos
    } = useCombos()

    const cart = reactive<Record<string, CartLine>>({})
    const cartItems = computed(() => Object.values(cart))
    const cartCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.qty, 0))
    const cartSubtotal = computed(() => cartItems.value.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0))

    function setComboQty(combo: ComboItem, qty: number) {
        const normalized = Math.max(0, Math.min(99, Math.round(qty)))
        if (!normalized) {
            delete cart[combo._id]
            return
        }
        cart[combo._id] = {
            menuItemId: combo._id,
            nombre: combo.nombre,
            unitPrice: combo.precio,
            qty: normalized
        }
    }
    function incrementCombo(combo: ComboItem) {
        const current = cart[combo._id]?.qty || 0
        setComboQty(combo, current + 1)
    }
    function decrementCombo(combo: ComboItem) {
        const current = cart[combo._id]?.qty || 0
        setComboQty(combo, current - 1)
    }
    function clearCart() {
        Object.keys(cart).forEach((key) => { delete cart[key] })
    }

    const handleFocusRefresh = () => {
        fetchLayout({ silent: true }).catch(() => {})
    }

    onMounted(() => {
        fetchLayout()
        if (process.client) {
            window.addEventListener('focus', handleFocusRefresh)
            window.addEventListener('visibilitychange', handleFocusRefresh)
        }
        fetchCombos({ force: true }).catch(() => {})
    })
    onBeforeUnmount(() => {
        if (process.client) {
            window.removeEventListener('focus', handleFocusRefresh)
            window.removeEventListener('visibilitychange', handleFocusRefresh)
        }
        stopHoldTicker()
    })

    watch(tables, () => {
        lastRefreshedAt.value = new Date().toISOString()
        pulseAutoRef()
    })

    watch(reserveMode, async (enabled) => {
        if (!enabled) {
            resetSelection()
            return
        }
        const ok = await requireLogin()
        if (!ok) reserveMode.value = false
    })

    watch(lastHold, () => {
        if (lastHold.value?.status === 'pending' && lastHold.value.expiresAt) {
            startHoldTicker()
        } else {
            stopHoldTicker()
        }
    }, { immediate: true })

    const stats = computed<LayoutStat[]>(() => ([
        { label: 'Total', value: totalSeats.value },
        { label: 'Ocupadas', value: takenSeats.value },
        { label: 'Libres', value: freeSeats.value }
    ]))

    const seatPrice = computed(() => Number(showtime.value?.price || 0))
    const selectionCount = computed(() => selectionList.value.length)
    const selectionTotal = computed(() => seatPrice.value * selectionCount.value)
    const hasCartItems = computed(() => cartItems.value.length > 0)
    const orderTotal = computed(() => selectionTotal.value + cartSubtotal.value)

    const formattedShowtime = computed(() => {
        if (!showtime.value?.fechaHora) return 'Horario por confirmar'
        return new Date(showtime.value.fechaHora).toLocaleString('es-CO', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    })

    const lastRefreshLabel = computed(() => {
        if (!lastRefreshedAt.value) return '—'
        return new Date(lastRefreshedAt.value).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    })

    const holdDescription = computed(() => {
        if (!lastHold.value) return ''
        const code = (lastHold.value.id || '').slice(-6).toUpperCase()
        const prefix = `Código ${code || lastHold.value.id} • $ ${money(lastHold.value.total)}`
        if (lastHold.value.status === 'paid') return `${prefix}. Pago confirmado.`
        if (holdCountdown.value) return `${prefix}. Expira en ${holdCountdown.value}.`
        if (lastHold.value.expiresAt) {
            const time = new Date(lastHold.value.expiresAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
            return `${prefix}. Expira a las ${time}.`
        }
        return prefix
    })

    const canReserve = computed(() => reserveMode.value && selectionCount.value > 0 && !reserving.value)
    const autoRefreshActive = computed(() => Boolean(autoRefTS.value))

    function money(value?: number) {
        return (Number(value || 0)).toLocaleString('es-CO')
    }

    async function requireLogin() {
        await ensureSession()
        if (user.value) return true
        toast.add({
            title: 'Inicia sesión para reservar',
            description: 'Necesitas iniciar sesión antes de bloquear tus sillas.',
            color: 'primary',
            icon: 'i-heroicons-lock-closed'
        })
        const redirect = encodeURIComponent(route.fullPath)
        await navigateTo(`/login?redirect=${redirect}`)
        return false
    }

    function pulseAutoRef() {
        if (autoRefTS.value) return
        autoRefTS.value = window.setTimeout(() => { autoRefTS.value = null }, 1000)
    }

    function stopHoldTicker() {
        if (holdTimer.value) {
            clearInterval(holdTimer.value)
            holdTimer.value = null
        }
        holdCountdown.value = null
    }

    function handleHoldExpired() {
        stopHoldTicker()
        if (!lastHold.value) return
        toast.add({
            title: 'Reserva expirada',
            description: 'Los asientos volvieron a estar disponibles. Selecciónalos de nuevo para intentar otra vez.',
            color: 'neutral',
            icon: 'i-heroicons-clock'
        })
        lastHold.value = null
        fetchLayout()
    }

    function tickHoldCountdown() {
        if (!lastHold.value?.expiresAt) {
            holdCountdown.value = null
            return
        }
        const expires = new Date(lastHold.value.expiresAt).getTime()
        const diff = expires - Date.now()
        if (diff <= 0) {
            holdCountdown.value = '00:00'
            handleHoldExpired()
            return
        }
        const minutes = Math.floor(diff / 60_000)
        const seconds = Math.floor((diff % 60_000) / 1000)
        holdCountdown.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }

    function startHoldTicker() {
        stopHoldTicker()
        tickHoldCountdown()
        holdTimer.value = setInterval(tickHoldCountdown, 1_000)
    }

    async function handleReserve() {
        if (!selectionCount.value || reserving.value) return
        if (!(await requireLogin())) return
        reserving.value = true
        try {
            const itemsPayload = cartItems.value.map(item => ({
                menuItemId: item.menuItemId,
                qty: item.qty
            }))
            const cartSnapshot = cartItems.value.map(item => ({ ...item }))
            const body = {
                showtimeId: showtimeId.value,
                seats: selectionList.value,
                ...(itemsPayload.length ? { items: itemsPayload } : {})
            }
            const headers: Record<string, string> = {}
            if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
                headers['Idempotency-Key'] = crypto.randomUUID()
            }
            const response = await $fetch<{
                reservation: { id: string; total: number }
                breakdown: { seatsTotal: number; foodTotal: number }
                expiresAt?: string
            }>('/api/reservations', {
                method: 'POST',
                credentials: 'include',
                body,
                headers
            })
            lastHold.value = {
                id: response.reservation.id,
                total: response.reservation.total,
                seatsTotal: response.breakdown.seatsTotal,
                foodTotal: response.breakdown.foodTotal,
                expiresAt: response.expiresAt ?? null,
                seats: selectionList.value.slice(),
                status: 'pending',
                items: cartSnapshot
            }
            toast.add({
                title: '¡Listo! Bloqueamos tus asientos',
                description: 'Confirma el pago antes de que expire el hold.',
                color: 'green',
                icon: 'i-heroicons-ticket'
            })
            reserveMode.value = false
            resetSelection()
            clearCart()
            fetchLayout()
        } catch (e: any) {
            const status = e?.response?.status || e?.statusCode
            let message = e?.data?.message || e?.message || 'No pudimos completar la reserva'
            if (status === 409) {
                message = 'Alguno de los asientos ya fue tomado. Actualizamos el layout.'
                fetchLayout()
            } else if (status === 401) {
                await requireLogin()
                message = 'Inicia sesión para continuar.'
            }
            toast.add({
                title: 'Reserva no completada',
                description: message,
                color: 'red',
                icon: 'i-heroicons-exclamation-triangle'
            })
        } finally {
            reserving.value = false
        }
    }

    async function confirmPayment() {
        if (!lastHold.value || lastHold.value.status === 'paid' || confirming.value) return
        if (!(await requireLogin())) return
        confirming.value = true
        try {
            await $fetch('/api/payments/confirm', {
                method: 'POST',
                credentials: 'include',
                body: { reservationId: lastHold.value.id }
            })
            lastHold.value = { ...lastHold.value, status: 'paid', expiresAt: null }
            toast.add({
                title: 'Pago confirmado',
                description: 'Tu reserva quedó marcada como pagada.',
                color: 'green',
                icon: 'i-heroicons-credit-card'
            })
            fetchLayout()
        } catch (e: any) {
            const message = e?.data?.message || e?.message || 'No pudimos confirmar el pago'
            toast.add({
                title: 'Error al confirmar',
                description: message,
                color: 'red',
                icon: 'i-heroicons-exclamation-triangle'
            })
        } finally {
            confirming.value = false
        }
    }

    return {
        showtimeId,
        showtime,
        showtimeLoading,
        showtimeError,
        fetchShowtimeDetails,
        layoutLoading,
        layoutError,
        tables,
        selected,
        toggleSeat,
        reserveMode,
        stats,
        seatPrice,
        selectionCount,
        selectionTotal,
        selectionList,
        hasCartItems,
        cartSubtotal,
        orderTotal,
        formattedShowtime,
        lastRefreshLabel,
        autoRefreshActive,
        canReserve,
        reserving,
        fetchLayout,
        handleReserve,
        combos,
        combosLoading,
        combosError,
        cart,
        cartCount,
        refreshCombos,
        clearCart,
        incrementCombo,
        decrementCombo,
        lastHold,
        holdDescription,
        holdCountdown,
        confirming,
        confirmPayment
    }
}
