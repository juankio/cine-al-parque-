import { ref, computed } from 'vue'
import { useToast } from '#imports'
import type { ReservationSummary } from '~/types/reservations'

type FetchOptions = {
  silent?: boolean
}

export const useReservations = () => {
  const toast = useToast()
  const reservations = ref<ReservationSummary[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const confirmingId = ref<string | null>(null)

  const pendingReservations = computed(() =>
    reservations.value.filter((reservation) => reservation.status === 'pending')
  )
  const hasReservations = computed(() => reservations.value.length > 0)

  async function fetchReservations(options: FetchOptions = {}) {
    if (!options.silent) loading.value = true
    error.value = null

    try {
      const data = await $fetch<ReservationSummary[]>('/api/reservations', {
        credentials: 'include'
      })
      reservations.value = data
    } catch (err: any) {
      const message =
        err?.data?.statusMessage ||
        err?.data?.message ||
        err?.message ||
        'No pudimos cargar tus reservas'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function confirmReservation(reservationId: string) {
    if (!reservationId || confirmingId.value === reservationId) return
    confirmingId.value = reservationId

    try {
      await $fetch('/api/payments/confirm', {
        method: 'POST',
        credentials: 'include',
        body: { reservationId }
      })

      toast.add({
        title: 'Reserva confirmada',
        description: 'Marcamos tu reserva como pagada.',
        color: 'success',
        icon: 'i-heroicons-check-circle'
      })

      await fetchReservations({ silent: true })
    } catch (err: any) {
      const message =
        err?.data?.statusMessage ||
        err?.data?.message ||
        err?.message ||
        'No pudimos confirmar la reserva'

      toast.add({
        title: 'Error al confirmar',
        description: message,
        color: 'red',
        icon: 'i-heroicons-exclamation-triangle'
      })
      throw err
    } finally {
      confirmingId.value = null
    }
  }

  return {
    reservations,
    loading,
    error,
    confirmingId,
    pendingReservations,
    hasReservations,
    fetchReservations,
    confirmReservation
  }
}
