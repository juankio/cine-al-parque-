// composables/useMenuAdmin.ts
import { ref, computed } from 'vue'

export function useMenuAdmin() {
    const rfetch = useRequestFetch()

    // Estado principal
    const items = ref<any[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Recetas (para el selector)
    const recipes = ref<{ value: string; label: string }[]>([])
    const recipesLoading = ref(false)

    // Filtro
    const search = ref('')
    const filtered = computed(() => {
        const term = search.value.toLowerCase().trim()
        if (!term) return items.value
        return items.value.filter((i) => String(i.nombre || '').toLowerCase().includes(term))
    })

    // Fetches
    async function fetchMenu(page = 1, pageSize = 200, q = '') {
        loading.value = true
        error.value = null
        try {
            const data = await rfetch('/api/admin/menu-items', { query: { page, pageSize, q } })
            items.value = (data as any)?.items || []
        } catch (e: any) {
            error.value = e?.data?.message || e?.message || 'Error cargando menú'
        } finally {
            loading.value = false
        }
    }

    async function fetchRecipes() {
        recipesLoading.value = true
        try {
            const data = await rfetch('/api/admin/recipes', { query: { page: 1, pageSize: 500 } })
            recipes.value = ((data as any)?.items || []).map((r: any) => ({
                value: r._id,
                label: r.nombre
            }))
        } finally {
            recipesLoading.value = false
        }
    }

    // CRUD
    async function createItem(payload: any) {
        await rfetch('/api/admin/menu-items', { method: 'POST', body: payload })
        await fetchMenu(1, 200, search.value)
    }

    async function updateItem(id: string, payload: any) {
        await rfetch(`/api/admin/menu-items/${id}`, { method: 'PATCH', body: payload })
        await fetchMenu(1, 200, search.value)
    }

    async function deleteItem(id: string) {
        await rfetch(`/api/admin/menu-items/${id}`, { method: 'DELETE' })
        await fetchMenu(1, 200, search.value)
    }

    return {
        // state
        items, loading, error, search, filtered,
        recipes, recipesLoading,
        // methods
        fetchMenu, fetchRecipes, createItem, updateItem, deleteItem
    }
}
