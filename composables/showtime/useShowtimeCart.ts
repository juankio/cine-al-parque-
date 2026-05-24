import { reactive, computed } from 'vue'
import type { ComboItem } from '~/composables/useCombos'
import type { CartLine } from '~/types/showtime'

export const useShowtimeCart = () => {
    const cart = reactive<Record<string, CartLine>>({})
    const cartItems = computed(() => Object.values(cart))
    const cartCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.qty, 0))
    const cartSubtotal = computed(() => cartItems.value.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0))

    function setComboQty(combo: ComboItem, qty: number) {
        const normalized = Math.max(0, Math.min(99, Math.round(qty)))
        if (!normalized) {
            delete cart[combo._id]
            return
        }
        cart[combo._id] = {
            menuItemId: combo._id,
            nombre: combo.nombre,
            unitPrice: combo.precio,
            qty: normalized
        }
    }

    function incrementCombo(combo: ComboItem) {
        const current = cart[combo._id]?.qty || 0
        setComboQty(combo, current + 1)
    }

    function decrementCombo(combo: ComboItem) {
        const current = cart[combo._id]?.qty || 0
        setComboQty(combo, current - 1)
    }

    function clearCart() {
        Object.keys(cart).forEach((key) => { delete cart[key] })
    }

    return {
        cart,
        cartItems,
        cartCount,
        cartSubtotal,
        setComboQty,
        incrementCombo,
        decrementCombo,
        clearCart
    }
}
