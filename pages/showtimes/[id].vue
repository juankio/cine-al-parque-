<script setup lang="ts">
import ShowtimeHeader from '~/components/showtimes/ShowtimeHeader.vue'
import ShowtimeCombos from '~/components/showtimes/ShowtimeCombos.vue'
import ShowtimeHoldAlert from '~/components/showtimes/ShowtimeHoldAlert.vue'
import ShowtimeLayoutBoard from '~/components/showtimes/ShowtimeLayoutBoard.vue'
import ShowtimeMobileFooter from '~/components/showtimes/ShowtimeMobileFooter.vue'
import { useShowtimePage } from '~/composables/useShowtimePage'

definePageMeta({ ssr: false })

const showtimePage = useShowtimePage()
const {
  showtimeId,
  showtime,
  showtimeLoading,
  showtimeError,
  fetchShowtimeDetails,
  layoutLoading,
  layoutError,
  tables,
  selected,
  toggleSeat,
  reserveMode,
  stats,
  seatPrice,
  selectionCount,
  selectionTotal,
  selectionList,
  hasCartItems,
  cartSubtotal,
  orderTotal,
  formattedShowtime,
  lastRefreshLabel,
  autoRefreshActive,
  canReserve,
  reserving,
  fetchLayout,
  handleReserve,
  combos,
  combosLoading,
  combosError,
  cart,
  cartCount,
  refreshCombos,
  clearCart,
  incrementCombo,
  decrementCombo,
  lastHold,
  holdDescription,
  holdCountdown,
  confirming,
  confirmPayment
} = showtimePage

</script>

<template>
  <UContainer class="py-8 space-y-6">
    <UAlert
      v-if="showtimeError"
      color="neutral"
      variant="soft"
      icon="i-heroicons-information-circle"
      :description="showtimeError"
      title="Esta función no está disponible"
    >
      <template #actions>
        <UButton size="xs" color="primary" variant="soft" @click="fetchShowtimeDetails">
          Reintentar
        </UButton>
      </template>
    </UAlert>

    <ShowtimeHeader
      :showtime="showtime"
      :formatted-showtime="formattedShowtime"
      :seat-price="seatPrice"
      :stats="stats"
      :reserve-mode="reserveMode"
      :selection-count="selectionCount"
      :selection-total="selectionTotal"
      :selection-list="selectionList"
      :has-cart-items="hasCartItems"
      :cart-subtotal="cartSubtotal"
      :order-total="orderTotal"
      :auto-refresh-active="autoRefreshActive"
      :last-refresh-label="lastRefreshLabel"
      :can-reserve="canReserve"
      :reserving="reserving"
      :loading-layout="layoutLoading"
      @toggle-reserve="reserveMode = !reserveMode"
      @refresh="fetchLayout"
      @reserve="handleReserve"
    />

    <ShowtimeLayoutBoard
      :loading="layoutLoading"
      :error-text="layoutError"
      :tables="tables"
      :reserve-mode="reserveMode"
      :selected-keys="selected"
      :showtime-id="showtimeId || undefined"
      :last-refresh-label="lastRefreshLabel"
      @refresh="fetchLayout"
      @toggle-seat="toggleSeat"
    />
    <ShowtimeHoldAlert
      v-if="lastHold"
      :hold="lastHold"
      :description="holdDescription"
      :countdown="holdCountdown"
      :confirming="confirming"
      @confirm="confirmPayment"
    />

    <ShowtimeCombos
      :combos="combos"
      :combos-loading="combosLoading"
      :combos-error="combosError"
      :cart="cart"
      :cart-count="cartCount"
      :cart-subtotal="cartSubtotal"
      :order-total="orderTotal"
      :selection-count="selectionCount"
      :has-cart-items="hasCartItems"
      @refresh="refreshCombos()"
      @clear="clearCart"
      @reserve="hasCartItems ? handleReserve() : (reserveMode = true)"
      @increment="incrementCombo"
      @decrement="decrementCombo"
    />

    <ShowtimeMobileFooter
      :reserve-mode="reserveMode"
      :selection-count="selectionCount"
      :has-cart-items="hasCartItems"
      :cart-count="cartCount"
      :cart-subtotal="cartSubtotal"
      :order-total="orderTotal"
      :reserving="reserving"
      :can-reserve="canReserve"
      @refresh="fetchLayout"
      @reserve="handleReserve"
    />
  </UContainer>
</template>
