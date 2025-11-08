// composables/useAdminRecipes.ts
import { ref, reactive, computed } from 'vue'

type Row = { ingredientId: string; amount: string | number }
type IngOpt = { value: string; label: string; unit?: string }

function toNumberOrNull(v: unknown) {
    if (v === null || v === undefined) return null
    if (typeof v === 'number') return Number.isFinite(v) ? v : null
    const s = String(v).trim()
    if (!s) return null
    const n = Number(s.replace(',', '.'))
    return Number.isFinite(n) ? n : null
}

export function useAdminRecipes() {
    // fetch con cookies SSR
    const rfetch = useRequestFetch()

    // --- Estado recetas
    const list = ref<{ items: any[]; page: number; pageSize: number; total: number } | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // --- Estado ingredientes (selector)
    const ingLoading = ref(false)
    const ingOptions = ref<IngOpt[]>([])

    // --- UI
    const q = ref('')
    const openPanel = ref(false)
    const isEditing = ref(false)
    const currentId = ref<string | null>(null)

    const openDelete = ref(false)
    const toDelete = ref<any>(null)

    // --- Form
    const form = reactive({
        nombre: '',
        porciones: '1', // string en UI
        activo: true,
        items: [] as Row[], // amount string/number; se convierte al guardar
    })

    // --- Helpers
    function resetForm() {
        Object.assign(form, { nombre: '', porciones: '1', activo: true, items: [] })
    }

    const filtered = computed(() => {
        const items = list.value?.items ?? []
        const term = q.value.toLowerCase().trim()
        if (!term) return items
        return items.filter(r => String(r.nombre || '').toLowerCase().includes(term))
    })

    // --- Cargas
    async function fetchRecipes(page = 1, pageSize = 50, search = '') {
        loading.value = true
        error.value = null
        try {
            const data = await rfetch('/api/admin/recipes', { query: { page, pageSize, q: search } })
            list.value = data as any
        } catch (e: any) {
            error.value = e?.data?.message || e?.message || 'Error cargando recetas'
        } finally {
            loading.value = false
        }
    }

    async function fetchIngredientsOptions() {
        ingLoading.value = true
        try {
            const data = await rfetch('/api/admin/ingredients', {
                query: { page: 1, pageSize: 500, activo: 'true' }
            })
            const items = (data as any)?.items || []
            ingOptions.value = items.map((i: any) => ({
                value: i._id,
                label: `${i.nombre} (${i.unidad})`,
                unit: i.unidad,
            }))
        } finally {
            ingLoading.value = false
        }
    }

    // --- Acciones
    function startCreate() {
        resetForm()
        currentId.value = null
        isEditing.value = false
        openPanel.value = true
    }

    function startEdit(rec: any) {
        currentId.value = rec._id
        isEditing.value = true
        const rows: Row[] = Array.isArray(rec.items)
            ? rec.items.map((r: any) => ({
                ingredientId: r.ingredientId || r.ingredient?._id || '',
                amount: String(r.amount ?? r.qtyBase ?? ''),
            }))
            : []
        Object.assign(form, {
            nombre: rec.nombre || '',
            porciones: String(rec.porciones ?? '1'),
            activo: !!rec.activo,
            items: rows,
        })
        openPanel.value = true
    }

    async function save() {
        const porcionesNum = toNumberOrNull(form.porciones)
        if (porcionesNum === null || porcionesNum < 1) {
            alert('Las porciones deben ser un número válido (>= 1)')
            return
        }

        const items = (form.items || [])
            .map(r => {
                const qty = toNumberOrNull(r.amount)
                return { ingredientId: r.ingredientId, qtyBase: qty }
            })
            .filter(r => r.ingredientId && r.qtyBase !== null && (r.qtyBase as number) > 0)
            .map(r => ({ ingredientId: r.ingredientId, qtyBase: r.qtyBase as number }))

        const payload = {
            nombre: form.nombre?.trim() || '',
            porciones: porcionesNum,
            activo: !!form.activo,
            items,
        }

        if (!payload.nombre) return alert('El nombre es obligatorio')
        if (!payload.items.length) return alert('Agrega al menos un ingrediente con cantidad > 0')

        try {
            if (isEditing.value && currentId.value) {
                await rfetch(`/api/admin/recipes/${currentId.value}`, { method: 'PATCH', body: payload })
            } else {
                await rfetch('/api/admin/recipes', { method: 'POST', body: payload })
            }
            openPanel.value = false
            await fetchRecipes(1, 50, q.value)
        } catch (err: any) {
            console.error('[RECETA] Error guardando', err)
            alert(err?.data?.message ?? err?.message ?? 'Error guardando')
        }
    }

    function askDelete(rec: any) {
        toDelete.value = rec
        openDelete.value = true
    }

    async function doDelete() {
        if (!toDelete.value) return
        try {
            await rfetch(`/api/admin/recipes/${toDelete.value._id}`, { method: 'DELETE' })
            openDelete.value = false
            await fetchRecipes(1, 50, q.value)
        } catch (err) {
            console.error('[RECETA] Error eliminando', err)
        }
    }

    return {
        // state
        list, loading, error,
        ingLoading, ingOptions,
        q, openPanel, isEditing, currentId,
        openDelete, toDelete,
        form, filtered,
        // methods
        fetchRecipes, fetchIngredientsOptions,
        startCreate, startEdit, save, askDelete, doDelete,
    }
}
