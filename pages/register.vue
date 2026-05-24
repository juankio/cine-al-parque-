<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue'
import { useRouter, useToast } from '#imports'
import { useAuth } from '~/composables/useAuth'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { animate, stagger } from 'animejs'
import AuthGraphicSidebar from '~/components/shared/AuthGraphicSidebar.vue'

definePageMeta({ layout: 'auth' })

const router = useRouter()
const toast = useToast()
const { register, loginWithGoogle, loading, error } = useAuth()
const localError = ref('')
const errMsg = computed(() => localError.value || (typeof error.value === 'string' ? error.value : ''))

const badgeHighlights = [
  { label: 'Centros activos', value: '12' },
  { label: 'Combos vendidos', value: '+8K' },
  { label: 'Tiempo de set up', value: '5 min' },
]

const onboardingSteps = [
  'Configura salas y mesas con asistentes guiados.',
  'Sincroniza precios y combos para cocina.',
  'Comparte tu enlace público para recibir reservas.',
]

