<script setup lang="ts">
import type { AdminMovie } from '~/composables/admin/useAdminMovies'
const model = defineModel<Partial<AdminMovie>>({ default: {} })

const posterPreview = computed(() =>
  model.value?.poster?.trim() ? model.value.poster.trim() : '/favicon.ico'
)

const clasificaciones = [
  {
    value: 'TP',
    label: 'Todo público',
    sub: 'Sin restricción de edad',
    icon: 'i-heroicons-users',
    iconScale: 'text-2xl'
  },
  {
    value: '7+',
    label: '7 años o más',
    sub: 'Recomendada para mayores de 7 años',
    icon: 'i-heroicons-user',
    iconScale: 'text-lg'
  },
  {
    value: '12+',
    label: '12 años o más',
    sub: 'No apta para menores de 12',
    icon: 'i-heroicons-user-circle',
    iconScale: 'text-lg'
  },
  {
    value: '15+',
    label: '15 años o más',
    sub: 'Recomendada para mayores de 15 años',
    icon: 'i-heroicons-user-group',
    iconScale: 'text-lg'
  },
  {
    value: '18+',
    label: 'Solo adultos',
    sub: 'Contenido explícito o violento',
    icon: 'i-heroicons-lock-closed',
    iconScale: 'text-lg'
  },
  {
    value: 'PG-13',
    label: 'PG-13',
    sub: 'Supervisión parental sugerida',
    icon: 'i-heroicons-shield-check',
    iconScale: 'text-lg'
  }
]

</script>

<template>
  <div class="space-y-8">
    <!-- TÍTULO -->
    <div>
      <label class="text-sm font-medium mb-2 block">Título</label>
      <UInput
        v-model.trim="model.titulo"
        placeholder="Ej: Spider-Man: Across the Spider-Verse"
        icon="i-heroicons-film"
        autofocus
      />
      <p class="text-xs text-muted mt-1">Nombre comercial que verá el público.</p>
    </div>

    <!-- POSTER + PREVIEW -->
    <div>
      <label class="text-sm font-medium mb-2 block">Poster</label>
      <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-start">
        <div>
          <UInput
            v-model.trim="model.poster"
            placeholder="URL de la imagen (vertical, 2:3)"
            icon="i-heroicons-photo"
          />
          <p class="text-xs text-muted mt-1">
            Usa un enlace directo (JPG/PNG). Ej: TMDB, CDN, etc.
          </p>
        </div>
        <div class="flex flex-col items-center text-center">
          <div
            class="h-32 w-24 rounded-lg border border-default/60 bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center"
          >
            <img
              :src="posterPreview"
              class="h-full w-full object-cover"
              alt="Poster preview"
            />
          </div>
          <span class="text-[10px] text-muted mt-1 leading-tight">Vista previa</span>
        </div>
      </div>
    </div>

    <!-- CLASIFICACIÓN -->
<div>
  <label class="text-sm font-medium mb-2 block">Clasificación</label>

  <!-- 👇 Cambiamos el grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <button
      v-for="c in clasificaciones"
      :key="c.value"
      type="button"
      @click="model.clasificacion = model.clasificacion === c.value ? '' : c.value"
      class="rounded-xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring flex items-start gap-3"
      :class="model.clasificacion === c.value
        ? 'border-primary bg-primary/5 ring-1 ring-primary/30 text-primary'
        : 'border-default hover:bg-muted/30 text-gray-700 dark:text-gray-300'"
    >
      <UIcon :name="c.icon" :class="`${c.iconScale} text-primary shrink-0 mt-0.5`" />
      <div class="flex flex-col leading-tight">
        <span class="font-medium text-sm">{{ c.label }}</span>
        <span class="text-[11px] text-muted">{{ c.sub }}</span>
      </div>
    </button>
  </div>

  <p class="text-xs text-muted mt-2">
    Define el público permitido según la regulación o contenido.
  </p>
</div>

    <!-- DURACIÓN -->
    <div>
      <label class="text-sm font-medium mb-2 block">Duración</label>
      <UInput
        v-model.number="model.duracion"
        type="number"
        min="1"
        placeholder="Duración (min)"
        icon="i-heroicons-clock"
      />
      <p class="text-xs text-muted mt-1">Minutos totales de proyección.</p>
    </div>

    <!-- SINOPSIS -->
    <div>
      <label class="text-sm font-medium mb-2 block">Sinopsis</label>
      <UTextarea
        v-model.trim="model.sinopsis"
        placeholder="Resumen corto para que la gente se antoje..."
        autoresize
        icon="i-heroicons-chat-bubble-left-right"
      />
      <p class="text-xs text-muted mt-1">
        Texto que se muestra en la tarjeta y detalle.
      </p>
    </div>

    <!-- ACTIVO -->
    <div class="flex items-start justify-between">
      <div>
        <h4 class="text-sm font-medium">Activo en cartelera</h4>
        <p class="text-xs text-muted">
          Si está activo, aparece en la cartelera pública.
        </p>
      </div>
      <USwitch v-model="model.activo" />
    </div>
  </div>
</template>
