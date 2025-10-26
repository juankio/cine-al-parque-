// ~/composables/admin/useAdminIngredients.ts
import { ref } from 'vue'

export function useAdminIngredients() {
    const rfetch = useRequestFetch()
    const list = ref<{ items: any[]; page: number; pageSize: number; total: number } | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchIngredients(page = 1, pageSize = 50, q = '') {
        loading.value = true
        error.value = null
        try {
            const data = await rfetch('/api/admin/ingredients', {
                query: { page, pageSize, q, _ts: Date.now() }, // evita caché
                headers: {
                    'cache-control': 'no-cache, no-store, must-revalidate',
                    pragma: 'no-cache',
                    expires: '0'
                }
            })
            list.value = data as any
        } catch (e: any) {
            error.value = e?.data?.message || e?.message || 'Error cargando ingredientes'
        } finally {
            loading.value = false
        }
    }

    async function createIngredient(body: any) {
        const payload = JSON.parse(JSON.stringify(body))
        console.log('[ING] POST /ingredients', payload)
        return rfetch('/api/admin/ingredients', { method: 'POST', body: payload })
    }

    async function updateIngredient(id: string, body: any) {
        const payload = JSON.parse(JSON.stringify(body))
        console.log('[ING] PATCH /ingredients/' + id, payload)
        return rfetch(`/api/admin/ingredients/${id}`, { method: 'PATCH', body: payload })
    }

    async function removeIngredient(id: string) {
        return rfetch(`/api/admin/ingredients/${id}`, { method: 'DELETE' })
    }

    return { list, loading, error, fetchIngredients, createIngredient, updateIngredient, removeIngredient }
}
