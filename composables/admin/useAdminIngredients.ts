// composables/admin/useAdminIngredients.ts
import { ref } from 'vue'

export type AdminIngredient = {
    _id: string
    nombre: string
    unidad: string // 'und' | 'g' | 'kg' | 'L' | 'ml' | ...
    stock: number
    costoUnitario: number
    activo: boolean
    createdAt?: string
    updatedAt?: string
}

type Paged<T> = {
    items: T[]
    page?: number
    pageSize?: number
    total?: number
}

export function useAdminIngredients() {
    const list = ref<Paged<AdminIngredient> | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchIngredients(page = 1, pageSize = 50, q?: string) {
        loading.value = true
        error.value = null
        try {
            const res = await $fetch<Paged<AdminIngredient>>('/api/admin/ingredients', {
                method: 'GET',
                params: { page, pageSize, q },
                credentials: 'include'
            })
            list.value = res ?? { items: [] }
        } catch (e: any) {
            error.value = e?.data?.message || e?.message || 'No se pudo cargar ingredientes'
        } finally {
            loading.value = false
        }
    }

    async function createIngredient(payload: Partial<AdminIngredient>) {
        loading.value = true
        error.value = null
        try {
            const created = await $fetch<AdminIngredient>('/api/admin/ingredients', {
                method: 'POST',
                body: payload,
                credentials: 'include'
            })
            // optimista: insertar al inicio si ya tenemos lista
            if (list.value) list.value.items = [created, ...(list.value.items ?? [])]
            return created
        } catch (e: any) {
            error.value = e?.data?.message || e?.message || 'No se pudo crear el ingrediente'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function updateIngredient(id: string, payload: Partial<AdminIngredient>) {
        loading.value = true
        error.value = null
        try {
            const updated = await $fetch<AdminIngredient>(`/api/admin/ingredients/${id}`, {
                method: 'PATCH',
                body: payload,
                credentials: 'include'
            })
            // optimista: actualizar en memoria
            if (list.value) {
                list.value.items = (list.value.items ?? []).map(i => (i._id === id ? { ...i, ...updated } : i))
            }
            return updated
        } catch (e: any) {
            error.value = e?.data?.message || e?.message || 'No se pudo actualizar el ingrediente'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function removeIngredient(id: string) {
        loading.value = true
        error.value = null
        try {
            await $fetch(`/api/admin/ingredients/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            // optimista: quitar de la lista
            if (list.value) {
                list.value.items = (list.value.items ?? []).filter(i => i._id !== id)
                if ((list.value.items as any).length === undefined) list.value.items = []
            }
        } catch (e: any) {
            error.value = e?.data?.message || e?.message || 'No se pudo eliminar el ingrediente'
            throw e
        } finally {
            loading.value = false
        }
    }

    return {
        list,
        loading,
        error,
        fetchIngredients,
        createIngredient,
        updateIngredient,
        removeIngredient
    }
}
