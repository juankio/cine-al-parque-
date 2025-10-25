<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const model = defineModel<string>({ default: '' }) // formato ISO
const open = ref(false)
const dateStr = ref('')
const timeStr = ref('')

watch(open, (o) => {
  if (o && (!dateStr.value || !timeStr.value)) {
    const d = model.value ? new Date(model.value) : new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    dateStr.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    timeStr.value = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
})

const label = computed(() =>
  model.value ? new Date(model.value).toLocaleString('es-CO') : ''
)

function apply() {
  if (!dateStr.value || !timeStr.value) return
  model.value = `${dateStr.value}T${timeStr.value}`
  open.value = false
}
</script>

<template>
  <UPopover v-model:open="open">
    <UButton
      block
      variant="outline"
      color="gray"
      class="justify-start"
      icon="i-heroicons-calendar-days-20-solid"
    >
      <span class="truncate">
        {{ label || 'Seleccionar fecha y hora…' }}
      </span>
    </UButton>

    <template #content>
      <div class="p-3 w-72 space-y-3">
        <UInput v-model="dateStr" type="date" />
        <UInput v-model="timeStr" type="time" />
        <div class="flex justify-end gap-2 pt-1">
          <UButton
            label="Cancelar"
            variant="subtle"
            color="neutral"
            @click="open = false"
          />
          <UButton label="Aceptar" color="primary" @click="apply" />
        </div>
      </div>
    </template>
  </UPopover>
</template>

