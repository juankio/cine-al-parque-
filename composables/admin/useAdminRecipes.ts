// ~/composables/admin/useAdminRecipes.ts
import { ref } from 'vue'

export function useAdminRecipes() {
    const rfetch = useRequestFetch()
    const list = ref<{ items: any[]; page: number; pageSize: number; total: number } | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchRecipes(page = 1, pageSize = 50, q = '') {
        loading.value = true
        error.value = null
        try {
            const data = await rfetch('/api/admin/recipes', { query: { page, pageSize, q } })
            list.value = data as any
        } catch (e: any) {
            error.value = e?.data?.message || e?.message || 'Error cargando recetas'
        } finally {
            loading.value = false
        }
    }

    async function createRecipe(body: any) {
        error.value = null
        try {
            return await rfetch('/api/admin/recipes', { method: 'POST', body })
        } catch (e: any) {
            error.value = e?.data?.message || e?.message || 'No se pudo crear'
            throw e
        }
    }

    async function updateRecipe(id: string, body: any) {
        error.value = null
        try {
            return await rfetch(`/api/admin/recipes/${id}`, { method: 'PATCH', body })
        } catch (e: any) {
            error.value = e?.data?.message || e?.message || 'No se pudo actualizar'
            throw e
        }
    }

    async function removeRecipe(id: string) {
        error.value = null
        try {
            return await rfetch(`/api/admin/recipes/${id}`, { method: 'DELETE' })
        } catch (e: any) {
            error.value = e?.data?.message || e?.message || 'No se pudo eliminar'
            throw e
        }
    }

    return { list, loading, error, fetchRecipes, createRecipe, updateRecipe, removeRecipe }
}
