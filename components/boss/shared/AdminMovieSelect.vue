<template>
  <div class="relative">
    <UPopover v-model="open" :popper="{ placement: 'bottom-start', strategy: 'fixed' }">
      <UInput
        v-model="q"
        type="search"
        placeholder="Buscar película…"
        icon="i-heroicons-magnifying-glass-20-solid"
        :loading="loading"
        @input="onType"
        class="w-full"
      />

      <template #panel>
        <div class="w-[min(92vw,32rem)] max-h-72 overflow-auto p-1">
          <!-- Resultados -->
          <template v-if="results.length">
            <UButton
              v-for="m in results"
              :key="m._id"
              variant="ghost"
              color="gray"
              class="justify-start w-full"
              @click="pick(m)"
            >
              {{ m.titulo }}
              <span v-if="!m.activo" class="ml-2 text-xs text-neutral-500">(inactiva)</span>
            </UButton>
          </template>

          <!-- Vacío -->
          <div v-else class="text-sm text-neutral-500 px-2 py-3">
            {{ q.trim().length < 2 ? 'Escribe al menos 2 letras…' : 'Sin resultados' }}
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>

<script setup>
const model = defineModel({ default: null }) // string | null
const q = ref('')
const results = ref([])
const open = ref(false)
const loading = ref(false)
let timer

async function search (term) {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: '1', pageSize: '10', q: term })
    const res = await $fetch(`/api/admin/movies?${params}`, { credentials: 'include' })
    results.value = res?.items ?? []
    open.value = true
  } catch (e) {
    results.value = []
    open.value = true
  } finally {
    loading.value = false
  }
}

function onType () {
  clearTimeout(timer)
  const term = q.value.trim()
  if (term.length < 2) {
    results.value = []
    open.value = false
    return
  }
  timer = setTimeout(() => search(term), 250)
}

function pick (m) {
  model.value = m._id
  q.value = m.titulo
  open.value = false
}
</script>
