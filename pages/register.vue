<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from '#imports'
import { useAuth } from '~/composables/useAuth'
import { validateRegister } from '~/utils/validators'

definePageMeta({ layout: 'auth' })

const router = useRouter()
const { register, loading, error } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const errMsg = computed(() => (typeof error.value === 'string' ? error.value : ''))

const badgeHighlights = [
  { label: 'Centros activos', value: '12' },
  { label: 'Combos vendidos', value: '+8K' },
  { label: 'Tiempo de set up', value: '5 min' },
]

const onboardingSteps = [
  'Configura salas y mesas con asistentes guiados.',
  'Sincroniza precios y combos para cocina y POS.',
  'Comparte tu enlace público para recibir reservas.',
]

const onSubmit = async () => {
  const v = validateRegister(name.value, email.value, password.value, confirm.value)
  if (v) return alert(v)
  try {
    await register({ name: name.value, email: email.value, password: password.value })
    router.push('/')
  } catch {}
}
</script>

<template>
  <div class="auth-shell register-shell">
    <div class="auth-glow" />

    <Motion
      tag="div"
      class="register-card"
      :initial="{ opacity: 0, y: 30 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }"
    >
      <div class="register-card__inner">
        <section class="register-card__form">
          <Motion
            tag="div"
            :initial="{ opacity: 0, x: -25 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 0.1, type: 'spring', stiffness: 230, damping: 20 } }"
            class="space-y-6"
          >
            <div class="text-center space-y-1">
              <h2 class="text-2xl font-semibold text-foreground">Crear cuenta</h2>
              <p class="text-sm text-muted">Completa tus datos para comenzar a operar</p>
            </div>

            <UForm @submit.prevent="onSubmit" class="space-y-4">
              <AuthTextField
                v-model="name"
                label="Nombre"
                name="name"
                icon="i-heroicons-user"
                autocomplete="name"
                required
              />
              <AuthTextField
                v-model="email"
                label="Correo"
                name="email"
                type="email"
                icon="i-heroicons-envelope"
                autocomplete="email"
                required
              />
              <AuthPasswordField
                v-model="password"
                label="Contraseña"
                name="password"
                autocomplete="new-password"
                required
              />
              <AuthPasswordField
                v-model="confirm"
                label="Confirmar contraseña"
                name="confirm"
                autocomplete="new-password"
                required
              />

              <UButton type="submit" color="primary" block size="lg" :loading="loading">
                Registrarme
              </UButton>

              <UAlert
                v-if="errMsg"
                color="red"
                variant="soft"
                icon="i-heroicons-exclamation-triangle"
                :description="errMsg"
              />
            </UForm>

            <p class="text-center text-sm text-muted">
              ¿Ya tienes cuenta?
              <NuxtLink to="/login" class="text-primary hover:underline">Inicia sesión</NuxtLink>
            </p>
          </Motion>
        </section>

        <div class="register-card__curve" aria-hidden="true">
          <svg
            viewBox="0 0 260 800"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="registerCurve" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#220304" />
                <stop offset="55%" stop-color="#ffced6" />
                <stop offset="100%" stop-color="#fff9f6" />
              </linearGradient>
            </defs>
            <path
              d="M0,0 C160,160 260,300 240,400 C220,500 120,640 0,800 L260,800 L260,0 Z"
              fill="url(#registerCurve)"
            />
          </svg>
        </div>

        <section class="register-card__showcase">
          <Motion
            tag="div"
            :initial="{ opacity: 0, x: 25 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 0.15, duration: 0.45 } }"
            class="space-y-6"
          >
            <UBadge color="white" variant="soft" class="uppercase tracking-[0.25em] text-xs text-muted">
              Equipo nuevo
            </UBadge>

            <div class="space-y-4">
              <h1 class="text-3xl sm:text-4xl font-bold leading-tight">
                Activa tu centro de cine al aire libre en minutos.
              </h1>
              <p class="text-base text-muted">
                Organiza funciones, combos y reservas con dashboards intuitivos. Cada usuario comparte información sincronizada.
              </p>
            </div>

            <ul class="space-y-2 text-sm text-muted">
              <li
                v-for="step in onboardingSteps"
                :key="step"
                class="flex items-start gap-3"
              >
                <span class="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>{{ step }}</span>
              </li>
            </ul>

            <div class="grid grid-cols-3 gap-3 mt-6">
              <div
                v-for="stat in badgeHighlights"
                :key="stat.label"
                class="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm"
              >
                <p class="text-xs uppercase tracking-wide text-slate-500">{{ stat.label }}</p>
                <p class="text-2xl font-semibold text-primary">{{ stat.value }}</p>
              </div>
            </div>
          </Motion>
        </section>
      </div>
    </Motion>
  </div>
</template>

<style scoped>
.auth-shell.register-shell {
  min-height: 100vh;
  background: radial-gradient(circle at 80% 20%, #7f1d1d, #220304 60%, #120102 100%);
  padding: clamp(1.5rem, 4vw, 3rem);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.register-shell .auth-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 70% 20%, rgba(244, 114, 182, 0.35), transparent 45%),
    radial-gradient(circle at 10% 80%, rgba(248, 113, 113, 0.25), transparent 45%);
  filter: blur(30px);
  opacity: 0.65;
  z-index: 0;
}
.register-card {
  width: min(1100px, 100%);
  z-index: 1;
}
.register-card__inner {
  background: #220304;
  border-radius: 40px;
  box-shadow: 0 45px 90px rgba(0, 0, 0, 0.35);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  position: relative;
  overflow: hidden;
}
.register-card__inner::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 40px;
  background: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08), transparent 45%);
  pointer-events: none;
}
.register-card__inner > * {
  position: relative;
  z-index: 2;
}
.register-card__curve {
  position: absolute;
  inset: -3% 35% -3% -10%;
  pointer-events: none;
  z-index: 1;
  transform: scaleX(-1);
  filter: drop-shadow(12px 0 35px rgba(0, 0, 0, 0.35));
}
.register-card__curve svg {
  width: 100%;
  height: 100%;
  display: block;
}
.register-card__form {
  padding: clamp(1.5rem, 4vw, 3rem);
  background: #220304;
  color: #fdf4f5;
  position: relative;
}
.register-card__form::after {
  content: '';
  position: absolute;
  inset: 1.5rem;
  border-radius: 36px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  pointer-events: none;
}
.register-card__form :deep(.u-input) {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: transparent;
  backdrop-filter: blur(8px);
  color: #fdf4f5;
}
.register-card__form :deep(.u-input:focus-within) {
  border-color: rgba(255, 255, 255, 0.35);
}
.register-card__form :deep(.u-button) {
  border-radius: 999px;
  background: linear-gradient(90deg, #dc2626, #f87171);
  border: none;
}
.register-card__form :deep(.u-checkbox-label) {
  color: rgba(255, 255, 255, 0.7);
}
.register-card__showcase {
  position: relative;
  padding: clamp(1.5rem, 4vw, 3rem);
  padding-left: clamp(1rem, 3vw, 2rem);
  color: #0f172a;
  border-top-right-radius: 40px;
  border-bottom-right-radius: 40px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.97), rgba(255, 228, 232, 0.97));
  box-shadow: inset 0 0 50px rgba(255, 255, 255, 0.5);
}
.register-card__showcase::before {
  content: '';
  position: absolute;
  inset: 0;
  border-top-right-radius: 40px;
  border-bottom-right-radius: 40px;
  background: radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.5), transparent 55%);
  opacity: 0.4;
}
.register-card__showcase > * {
  position: relative;
  z-index: 1;
}
@media (max-width: 960px) {
  .register-card__inner {
    border-radius: 28px;
    overflow: visible;
  }
  .register-card__form::after {
    inset: 1rem;
    border-radius: 28px;
  }
  .register-card__curve {
    display: none;
  }
}
</style>
