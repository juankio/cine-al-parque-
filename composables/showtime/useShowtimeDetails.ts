import { ref, computed, watch } from 'vue'
import type { ShowtimeInfo } from '~/types/showtime'
import { useRoute } from '#imports'

export const useShowtimeDetails = () => {
    const route = useRoute()
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

    return {
        showtimeId,
        showtime,
        showtimeLoading,
        showtimeError,
        fetchShowtimeDetails
    }
}
