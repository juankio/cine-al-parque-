import { ref, computed } from 'vue'
import type { ReservationSnapshot } from '~/types/showtime'
import { useToast } from '#imports'

export const useShowtimeHold = (fetchLayout: Function, clearSelection: Function, clearCart: Function) => {
    const toast = useToast()
    const reserving = ref(false)
    const reserveMode = ref(true) // true: pending (demo) | false: paid
    const lastHold = ref<ReservationSnapshot | null>(null)
    const holdCountdown = ref<string | null>(null)
    const holdTimer = ref<ReturnType<typeof setInterval> | null>(null)

    function money(value?: number) {
        return (Number(value || 0)).toLocaleString('es-CO')
    }

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
            description: `Tus asientos se han liberado. Refrescando sala...`,
            color: 'error',
            icon: 'i-heroicons-clock'
        })
        lastHold.value = null
        clearSelection()
        clearCart()
        fetchLayout({ silent: true }).catch(() => { })
    }

    function startHoldTicker(expiresAtStr: string) {
        stopHoldTicker()
        const target = new Date(expiresAtStr).getTime()

        const update = () => {
            const now = Date.now()
            const diff = target - now
            if (diff <= 0) {
                handleHoldExpired()
                return
            }
            const mins = Math.floor(diff / 60000)
            const secs = Math.floor((diff % 60000) / 1000)
            holdCountdown.value = `${mins}:${secs.toString().padStart(2, '0')}`
        }

        update()
        if (lastHold.value) {
            holdTimer.value = setInterval(update, 1000)
        }
    }

    return {
        reserving,
        reserveMode,
        lastHold,
        holdCountdown,
        holdTimer,
        holdDescription,
        stopHoldTicker,
        handleHoldExpired,
        startHoldTicker
    }
}
