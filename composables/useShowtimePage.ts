import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useToast, navigateTo } from '#imports'
import { useShowtimeLayout } from '~/composables/useShowtimeLayout'
import { useAuth } from '~/composables/useAuth'
import { useCombos } from '~/composables/useCombos'
import { useShowtimeDetails } from './showtime/useShowtimeDetails'
import { useShowtimeCart } from './showtime/useShowtimeCart'
import { useShowtimeHold } from './showtime/useShowtimeHold'
import type { LayoutStat } from '~/types/showtime'

export const useShowtimePage = () => {
    const toast = useToast()
    const route = useRoute()
    const { user, ensureSession } = useAuth()

    const { showtimeId, showtime, showtimeLoading, showtimeError, fetchShowtimeDetails } = useShowtimeDetails()

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
        resetSelection,
        selectionCount,
        hasTakenSelected,
        lastRefreshDate
    } = useShowtimeLayout(showtimeId)

    const autoRefTS = ref<number | null>(null)

    const {
        combos,
        loading: combosLoading,
        error: combosError,
        fetchCombos,
        refresh: refreshCombos
    } = useCombos()

    const { cart, cartItems, cartCount, cartSubtotal, setComboQty, incrementCombo, decrementCombo, clearCart } = useShowtimeCart()
    
    const { reserving, reserveMode, lastHold, holdCountdown, holdTimer, holdDescription, stopHoldTicker, handleHoldExpired, startHoldTicker } = useShowtimeHold(fetchLayout, resetSelection, clearCart)

    const handleFocusRefresh = () => {
        fetchLayout({ silent: true }).catch(() => { })
    }

    onMounted(() => {
        fetchLayout()
        if (process.client) {
            window.addEventListener('focus', handleFocusRefresh)
            window.addEventListener('visibilitychange', handleFocusRefresh)
        }
        fetchCombos({ force: true }).catch(() => { })
    })

    onBeforeUnmount(() => {
        if (process.client) {
            window.removeEventListener('focus', handleFocusRefresh)
            window.removeEventListener('visibilitychange', handleFocusRefresh)
        }
        stopHoldTicker()
    })

    watch(tables, () => {
        if (reserveMode.value && hasTakenSelected.value) {
            toast.add({
                title: 'Alguien se adelantó',
                description: 'Algunos de tus asientos ya no están disponibles.',
                color: 'error',
                icon: 'i-heroicons-exclamation-triangle'
            })
            resetSelection()
        }
    }, { deep: true })

    watch(lastHold, (nv) => {
        if (nv?.expiresAt && nv.status === 'pending') {
            startHoldTicker(nv.expiresAt)
        } else {
            stopHoldTicker()
        }
    })

    const canReserve = computed(() => reserveMode.value && selectionCount.value > 0 && !reserving.value)
    const autoRefreshActive = computed(() => Boolean(autoRefTS.value))

    function money(value?: number) {
        return (Number(value || 0)).toLocaleString('es-CO')
    }

    const seatPrice = computed(() => showtime.value?.price || 0)
    const selectionTotal = computed(() => selectionCount.value * seatPrice.value)
    const hasCartItems = computed(() => cartCount.value > 0)
    const orderTotal = computed(() => selectionTotal.value + cartSubtotal.value)

    const formattedShowtime = computed(() => {
        if (!showtime.value?.fechaHora) return ''
        const d = new Date(showtime.value.fechaHora)
        const dateStr = d.toLocaleDateString('es-CO', { weekday: 'long', month: 'long', day: 'numeric' })
        const timeStr = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
        return `${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)} • ${timeStr}`
    })

    const stats = computed<LayoutStat[]>(() => [
        { label: 'Disponibles', value: freeSeats.value, color: 'text-primary' },
        { label: 'Ocupados', value: takenSeats.value, color: 'text-muted-foreground' },
        { label: 'Total', value: totalSeats.value, color: 'text-foreground' }
    ])

    const lastRefreshLabel = computed(() => {
        if (!lastRefreshDate.value) return 'Nunca'
        return lastRefreshDate.value.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    })

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
                color: 'success',
                icon: 'i-heroicons-ticket'
            })
            reserveMode.value = false
            resetSelection()
            clearCart()
            fetchLayout()
        } catch (e: any) {
            const status = e?.response?.status || e?.statusCode
            toast.add({
                title: 'No pudimos bloquear los asientos',
                description: e?.data?.message || e?.message || 'Error desconocido',
                color: status === 409 ? 'warning' : 'error',
                icon: status === 409 ? 'i-heroicons-exclamation-triangle' : 'i-heroicons-x-circle'
            })
            if (status === 409) {
                resetSelection()
                fetchLayout({ silent: true })
            }
        } finally {
            reserving.value = false
        }
    }

    const confirmLoading = ref(false)
    async function handleConfirmPayment() {
        if (!lastHold.value) return
        if (!(await requireLogin())) return
        confirmLoading.value = true
        try {
            const body = { reservationId: lastHold.value.id }
            await $fetch('/api/payments/confirm', {
                method: 'POST',
                credentials: 'include',
                body
            })
            toast.add({
                title: '¡Pago Confirmado!',
                description: 'Tus sillas y combos están asegurados. Revisa tus entradas.',
                color: 'success',
                icon: 'i-heroicons-check-badge'
            })
            lastHold.value.status = 'paid'
            lastHold.value.expiresAt = null
        } catch (e: any) {
            toast.add({
                title: 'Error confirmando el pago',
                description: e?.data?.message || e?.message || 'Revisa tu conexión.',
                color: 'error'
            })
        } finally {
            confirmLoading.value = false
        }
    }

    const cancelLoading = ref(false)
    async function handleCancelHold() {
        if (!lastHold.value) return
        cancelLoading.value = true
        try {
            await $fetch(`/api/reservations/${lastHold.value.id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            toast.add({
                title: 'Reserva cancelada',
                description: 'Los asientos han sido liberados.',
                color: 'info',
                icon: 'i-heroicons-information-circle'
            })
            lastHold.value = null
            reserveMode.value = true
            resetSelection()
            fetchLayout()
        } catch (e: any) {
            toast.add({
                title: 'No se pudo cancelar',
                description: e?.data?.message || e?.message,
                color: 'error'
            })
        } finally {
            cancelLoading.value = false
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
        totalSeats,
        takenSeats,
        freeSeats,
        selected,
        selectionList,
        selectionCount,
        hasTakenSelected,
        fetchLayout,
        toggleSeat,
        resetSelection,

        combos,
        combosLoading,
        combosError,
        fetchCombos,
        refreshCombos,

        cart,
        cartItems,
        cartCount,
        cartSubtotal,
        setComboQty,
        incrementCombo,
        decrementCombo,
        clearCart,

        reserving,
        reserveMode,
        lastHold,
        holdCountdown,
        holdDescription,
        canReserve,
        autoRefreshActive,

        pulseAutoRef,
        handleReserve,
        confirmPayment: handleConfirmPayment,
        confirmLoading,
        confirming: confirmLoading,
        handleCancelHold,
        cancelLoading,
        
        stats,
        seatPrice,
        selectionTotal,
        hasCartItems,
        orderTotal,
        formattedShowtime,
        lastRefreshLabel
    }
}
