<template>
  <div class="relative">
    <input
      v-model="q"
      type="search"
      placeholder="Buscar película…"
      class="w-full rounded-xl border border-theme px-3 py-2 bg-surface"
      @input="onType"
    />
    <div
      v-if="open && results.length"
      class="absolute z-10 mt-1 w-full rounded-xl border border-theme bg-surface shadow"
    >
      <button
        v-for="m in results"
        :key="m._id"
        class="block w-full text-left px-3 py-2 hover:bg-brand/10"
        @click="pick(m)"
      >
        {{ m.titulo }}
        <span v-if="!m.activo" class="ml-2 text-xs text-neutral-500">(inactiva)</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
type AdminMovie = { _id: string; titulo: string; activo?: boolean };

const model = defineModel<string | null>({ default: null });
const q = ref("");
const results = ref<AdminMovie[]>([]);
const open = ref(false);
let timer: any;

async function search(term: string) {
  const params = new URLSearchParams({ page: "1", pageSize: "10", q: term });
  const res = await $fetch<{ items: AdminMovie[] }>(`/api/admin/movies?${params}`, {
    credentials: "include",
  });
  results.value = res.items ?? [];
  open.value = true;
}

function onType() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const term = q.value.trim();
    if (term.length >= 2) search(term);
    else {
      results.value = [];
      open.value = false;
    }
  }, 250);
}

function pick(m: AdminMovie) {
  model.value = m._id;
  q.value = m.titulo;
  open.value = false;
}
</script>
