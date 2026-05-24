<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue'
import { useRouter, useRoute, useToast } from '#imports'
import { useAuth } from '~/composables/useAuth'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { animate, stagger } from 'animejs'
import AuthGraphicSidebar from '~/components/shared/AuthGraphicSidebar.vue'

definePageMeta({ layout: 'auth' })

const router = useRouter()
const route = useRoute()
const { user, login, loginWithGoogle, loading, error } = useAuth()
const toast = useToast()
const localError = ref('')
const errMsg = computed(() => localError.value || (typeof error.value === 'string' ? error.value : ''))

const heroPerks = [
  'Reserva salas en tiempo real.',
  'Sincroniza combos con cocina/POS.',
  'Recibe métricas y alertas en vivo.',
]

