// /composables/admin/useAdminLayout.ts

export type PatternCell = '2' | '4'

export interface GenerateGridPayload {
    replace?: boolean
    rows: number
    cols: number
    pattern: PatternCell[][]
    prefix?: string
}

export interface GenerateSimplePayload {
    replace?: boolean
    tables2: number
    tables4: number
    prefix?: string
}

export type GeneratePayload = GenerateGridPayload | GenerateSimplePayload

type GenerateResponse = {
    ok: boolean
    showtimeId: string
    // nombres “compatibles”
    tables?: number
    seats?: number
    createdTables?: number
    createdSeats?: number
    totalTables?: number
    totalSeats?: number
    deletedTables?: number
    deletedSeats?: number
    prefix?: string
    replace?: boolean
}

export function useAdminLayout() {
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function generate(showtimeId: string, payload: GeneratePayload): Promise<GenerateResponse> {
        loading.value = true
        error.value = null
        try {
            const res = await $fetch<GenerateResponse>(`/api/admin/showtimes/${showtimeId}/layout/generate`, {
                method: 'POST',
                credentials: 'include',
                body: payload as any,
            })
            console.log('[useAdminLayout][generate] res:', res)
            return res
        } catch (e: any) {
            console.error('[useAdminLayout][generate] error:', e)
            error.value = e?.data?.message || e?.message || 'No se pudo generar el layout'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function setActive(showtimeId: string, active: boolean) {
        try {
            const res = await $fetch(`/api/admin/showtimes/${showtimeId}`, {
                method: 'PATCH',
                credentials: 'include',
                body: { active },
            })
            return res
        } catch (e: any) {
            console.error('[useAdminLayout][setActive] error:', e)
            error.value = e?.data?.message || e?.message || 'No se pudo cambiar el estado del showtime'
            throw e
        }
    }

    return { loading, error, generate, setActive }
}
