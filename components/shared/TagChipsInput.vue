<script setup lang="ts">
import { ref, watch } from 'vue'

type Props = {
  modelValue: string[]
  suggestions?: string[]    // sugerencias opcionales (“combo”, “vegano”, etc.)
  placeholder?: string
  max?: number | null       // límite de tags (null = sin límite)
  allowDuplicates?: boolean // permitir duplicados (por defecto false)
  normalize?: boolean       // normalizar a lower-case + trim (por defecto true)
}
const props = withDefaults(defineProps<Props>(), {
  suggestions: () => [],
  placeholder: 'Escribe una etiqueta y presiona Enter',
  max: null,
  allowDuplicates: false,
  normalize: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

// hacemos una copia local y sincronizamos solo cuando cambie la prop
const local = ref<string[]>([...props.modelValue])
watch(() => props.modelValue, v => { local.value = [...v] }, { deep: true })

const input = ref('')

function norm(v: string) {
  const t = props.normalize ? v.trim().toLowerCase() : v.trim()
  return t
}

function exists(tag: string) {
  const t = norm(tag)
  return local.value.some(x => norm(x) === t)
}

function addTag(raw?: string) {
  const rawVal = typeof raw === 'string' ? raw : input.value
  let t = norm(rawVal)
  if (!t) return
  if (!props.allowDuplicates && exists(t)) { input.value = ''; return }
  if (props.max !== null && local.value.length >= props.max) { return }
  local.value = [...local.value, t]
  emit('update:modelValue', local.value)
  input.value = ''
}

function removeTag(i: number) {
  const next = local.value.slice()
  next.splice(i, 1)
  local.value = next
  emit('update:modelValue', next)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  } else if (e.key === 'Backspace' && !input.value && local.value.length) {
    // backspace con input vacío elimina el último tag
    removeTag(local.value.length - 1)
  }
}
</script>

<template>
  <div class="space-y-2">
    <!-- Chips -->
    <div class="flex flex-wrap gap-2 min-h-6">
      <span
        v-for="(tag, i) in local"
        :key="tag + ':' + i"
        class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs
               bg-primary/10 text-primary ring-1 ring-primary/20"
      >
        {{ tag }}
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          icon="i-heroicons-x-mark-20-solid"
          class="!px-1 !py-0.5"
          @click="removeTag(i)"
        />
      </span>
      <span v-if="!local.length" class="text-xs text-muted">Sin etiquetas</span>
    </div>

    <!-- Input -->
    <UInput
      v-model="input"
      :placeholder="placeholder"
      icon="i-heroicons-hashtag-20-solid"
      @keydown="onKeydown"
      @blur="addTag()"
    />

    <!-- Sugerencias -->
    <div v-if="suggestions?.length" class="flex flex-wrap gap-2 pt-1">
      <UButton
        v-for="s in suggestions"
        :key="s"
        size="xs"
        variant="soft"
        :color="exists(s) ? 'primary' : 'gray'"
        :class="exists(s) ? 'ring-1 ring-primary/30' : ''"
        @click="addTag(s)"
      >
        #{{ s }}
      </UButton>
    </div>
  </div>
</template>
