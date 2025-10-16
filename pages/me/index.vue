<script setup lang="ts">
definePageMeta({ auth: true, ssr: false })

const { user, ensureSession } = useAuth()
const { stats, history: meHistory, loading, error, fetchStats, fetchHistory } = useMe()

onMounted(async () => {
  await ensureSession()
  if (!user.value) {
    const redirect = encodeURIComponent('/me')
    return navigateTo(`/login?redirect=${redirect}`)
  }
  // Carga ambos en paralelo
  await Promise.all([fetchStats(), fetchHistory()])
})

// Computed seguros
const items = computed(() => meHistory.value?.items ?? [])
const visits = computed(() => stats.value?.visits ?? 0)
const spent = computed(() => stats.value?.totalSpent ?? 0)
const favorite = computed(() => stats.value?.favorite ?? null)
</script>

<template>
  <section class="p-6 space-y-8">
    <header>
      <h2 class="text-2xl font-bold">Mi cuenta</h2>
      <p class="text-sm text-neutral-400">
        Bienvenido, {{ user?.name || user?.email }} 👋
      </p>
    </header>

    <!-- STATS -->
    <div class="grid md:grid-cols-3 gap-4">
      <div class="rounded-xl border border-theme bg-surface p-4 text-center">
        <p class="text-sm text-neutral-400">Visitas totales</p>
        <p class="text-2xl font-bold">{{ visits }}</p>
      </div>

      <div class="rounded-xl border border-theme bg-surface p-4 text-center">
        <p class="text-sm text-neutral-400">Total gastado</p>
        <p class="text-2xl font-bold">$ {{ spent.toLocaleString('es-CO') }}</p>
      </div>

      <div
        v-if="favorite"
        class="rounded-xl border border-theme bg-surface p-4 text-center"
      >
        <p class="text-sm text-neutral-400">Peli favorita</p>
        <p class="text-lg font-semibold">{{ favorite.titulo }}</p>
        <img
          :src="favorite.poster || '/placeholder.png'"
          alt=""
          class="mx-auto mt-2 h-24 w-auto rounded-lg object-cover"
        />
      </div>
    </div>

    <!-- ERRORES / LOADING -->
    <div v-if="loading" class="text-neutral-400 text-center">Cargando datos…</div>
    <div v-else-if="error" class="text-red-500 text-center">{{ error }}</div>

    <!-- HISTORIAL -->
    <div v-else>
      <h3 class="text-xl font-semibold mt-6 mb-3">Historial de reservas</h3>
      <div v-if="items.length === 0" class="text-neutral-400 text-center">
        No tienes reservas todavía.
      </div>

      <div v-else class="grid gap-4">
        <article
          v-for="r in items"
          :key="r.id"
          class="rounded-xl border border-theme bg-surface p-4"
        >
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">
              🎬 {{ r.movie?.titulo || 'Sin título' }}
            </h3>
            <span
              class="rounded-md px-2 py-0.5 text-xs font-medium"
              :class="{
                'bg-green-500/15 text-green-400': r.status === 'paid',
                'bg-yellow-500/15 text-yellow-400': r.status === 'pending',
                'bg-neutral-500/15 text-neutral-400': r.status === 'expired',
                'bg-red-500/15 text-red-400': r.status === 'canceled'
              }"
            >
              {{ r.status }}
            </span>
          </div>

          <p class="text-sm text-neutral-500 mt-1">
            Sala {{ r.showtime?.sala || '—' }} — 
            {{ new Date(r.showtime?.fechaHora || Date.now()).toLocaleString() }}
          </p>

          <p class="text-sm text-neutral-500">
            Asientos: {{ (r.seats || []).join(', ') }}
          </p>

          <p class="text-sm text-neutral-500">
            Total: $ {{ (r.total || 0).toLocaleString('es-CO') }}
          </p>

          <div v-if="r.cart?.length" class="mt-2 text-sm text-neutral-400">
            <p>🍔 Comida:</p>
            <ul class="list-disc ml-5">
              <li v-for="(c, i) in r.cart" :key="i">
                {{ c.qty }} × {{ c.nombre }} — 
                $ {{ (c.unitPrice * c.qty).toLocaleString('es-CO') }}
              </li>
            </ul>
          </div>

          <p v-if="r.status === 'pending' && r.expiresAt" class="text-xs text-neutral-500 mt-2">
            Expira: {{ new Date(r.expiresAt).toLocaleTimeString() }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
