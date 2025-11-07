<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from '#imports'
import { useAuth } from '~/composables/useAuth'
import { validateLogin } from '~/utils/validators'

definePageMeta({ layout: 'auth' })

const router = useRouter()
const route = useRoute()
const { user, login, loading, error } = useAuth()

const email = ref('')
const password = ref('')
const remember = ref(false)
const errMsg = computed(() => (typeof error.value === 'string' ? error.value : ''))

const heroPerks = [
  'Reserva salas en tiempo real.',
  'Sincroniza combos con cocina/POS.',
  'Recibe métricas y alertas en vivo.',
]

function decodeLoop(val: string, max = 5) {
  let out = val
  for (let i = 0; i < max; i++) {
    const dec = decodeURIComponent(out)
    if (dec === out) break
    out = dec
  }
  return out
}
function resolveRedirect(raw: unknown): string {
  let r = Array.isArray(raw) ? raw[0] : (raw as string | undefined)
  if (!r) return '/'
  r = decodeLoop(r)
  if (!r.startsWith('/')) return '/'
  if (r.startsWith('/login')) return '/'
  if (r.length > 1024) return '/'
  return r
}

onMounted(() => {
  if (user.value) {
    router.replace(resolveRedirect(route.query.redirect))
    return
  }
  try {
    const hint = localStorage.getItem('cine.user.email')
    if (hint) email.value = hint
  } catch {}
})

const onSubmit = async () => {
  const v = validateLogin(email.value, password.value)
  if (v) return alert(v)
  try {
    await login({ email: email.value, password: password.value, remember: remember.value })
    await router.replace(resolveRedirect(route.query.redirect))
  } catch {}
}
</script>

<template>
  <div class="auth-shell">
    <div class="auth-glow" />

    <Motion
      tag="div"
      class="login-card"
      :initial="{ opacity: 0, y: 30 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }"
    >
      <div class="login-card__inner">
        <section class="login-card__showcase">
          <Motion
            tag="div"
            class="showcase-blob"
            :initial="{ opacity: 0, scale: 0.9, rotate: -4 }"
            :enter="{ opacity: 1, scale: 1, rotate: 0, transition: { delay: 0.15, type: 'spring', stiffness: 200, damping: 18 } }"
          >
            <div class="showcase-blob__halo" />
            <div class="showcase-blob__tree">
              <span class="tree trunk" />
              <span class="tree leaf leaf-1" />
              <span class="tree leaf leaf-2" />
              <span class="tree leaf leaf-3" />
            </div>
            <div class="showcase-blob__ornaments">
              <span v-for="n in 5" :key="n" class="bubble" />
            </div>
            <div class="showcase-blob__sled">
              <UIcon name="i-heroicons-gift" class="text-primary text-2xl" />
            </div>
          </Motion>

          <div class="showcase-meta">
            <img src="/favicon.ico" alt="Cine al Parque" class="showcase-logo" />
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-muted font-semibold">Cine al Parque</p>
              <h1 class="text-3xl font-bold text-slate-900 dark:text-white leading-snug">
                Gestiona funciones, combos y reservas sin fricción.
              </h1>
              <ul class="space-y-2 mt-4 text-sm text-slate-600 dark:text-slate-200">
                <li
                  v-for="perk in heroPerks"
                  :key="perk"
                  class="flex items-center gap-2"
                >
                  <span class="h-2 w-2 rounded-full bg-primary" />
                  {{ perk }}
                </li>
              </ul>
            </div>
          </div>
        </section>

        <div class="login-card__curve" aria-hidden="true">
          <svg
            viewBox="0 0 260 800"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fff9f6" />
                <stop offset="60%" stop-color="#ffe0e4" />
                <stop offset="100%" stop-color="#220304" />
              </linearGradient>
            </defs>
            <path
              d="M0,0 C160,160 260,300 240,400 C220,500 120,640 0,800 L260,800 L260,0 Z"
              fill="url(#curveGradient)"
            />
          </svg>
        </div>

        <section class="login-card__form">
          <Motion
            tag="div"
            :initial="{ opacity: 0, x: 20 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 0.15, type: 'spring', stiffness: 230, damping: 22 } }"
            class="space-y-6"
          >
            <div>
              <h2 class="text-2xl font-semibold text-foreground">Login</h2>
              <p class="text-sm text-muted">Ingresa tus credenciales corporativas</p>
            </div>

            <UForm @submit.prevent="onSubmit" class="space-y-4">
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
                autocomplete="current-password"
                required
              />

              <div class="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <UCheckbox v-model="remember" label="Recuérdame" color="primary" />
                <NuxtLink to="/login#recuperar" class="text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </NuxtLink>
              </div>

              <UButton type="submit" color="primary" block size="lg" :loading="loading">
                Entrar
              </UButton>

              <UAlert
                v-if="errMsg"
                color="red"
                variant="soft"
                icon="i-heroicons-exclamation-triangle"
                :description="errMsg"
              />
            </UForm>

            <div class="text-sm text-muted text-center space-y-1">
              <p>
                ¿No tienes cuenta?
                <NuxtLink to="/register" class="text-primary font-semibold hover:underline">
                  Regístrate ahora
                </NuxtLink>
              </p>
              <NuxtLink to="/login#terms" class="text-xs text-muted hover:underline">Términos y condiciones</NuxtLink>
            </div>
          </Motion>
        </section>
      </div>
    </Motion>
  </div>
</template>

<style scoped>
.auth-shell {
  min-height: 100vh;
  background: radial-gradient(circle at 20% 20%, #7f1d1d, #450a0a 55%, #1f0303 100%);
  padding: clamp(1.5rem, 4vw, 3rem);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.auth-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 25% 25%, rgba(255, 154, 154, 0.45), transparent 45%),
    radial-gradient(circle at 80% 80%, rgba(244, 63, 94, 0.35), transparent 50%);
  filter: blur(32px);
  opacity: 0.7;
  z-index: 0;
}
.login-card {
  width: min(1100px, 100%);
  z-index: 1;
}
.login-card__inner {
  background: #220304;
  border-radius: 40px;
  box-shadow: 0 45px 90px rgba(0, 0, 0, 0.35);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  position: relative;
  overflow: hidden;
}
.login-card__inner::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 40px;
  background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.08), transparent 45%);
  pointer-events: none;
}
.login-card__inner > * {
  position: relative;
  z-index: 2;
}
.login-card__curve {
  position: absolute;
  inset: -3% -10% -3% 40%;
  pointer-events: none;
  z-index: 1;
  filter: drop-shadow(-12px 0 35px rgba(0, 0, 0, 0.35));
}
.login-card__curve svg {
  width: 100%;
  height: 100%;
  display: block;
}
.login-card__showcase {
  position: relative;
  padding: clamp(1.5rem, 4vw, 3rem);
  padding-right: clamp(1rem, 3vw, 2rem);
  color: #0f172a;
  border-top-left-radius: 40px;
  border-bottom-left-radius: 40px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.97), rgba(255, 228, 232, 0.97));
  box-shadow: inset 0 0 50px rgba(255, 255, 255, 0.5);
}
.login-card__showcase::before {
  content: '';
  position: absolute;
  inset: 0;
  border-top-left-radius: 40px;
  border-bottom-left-radius: 40px;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6), transparent 55%);
  opacity: 0.4;
}
.login-card__showcase > * {
  position: relative;
  z-index: 1;
}
.login-card__form {
  padding: clamp(1.5rem, 4vw, 3rem);
  background: #220304;
  color: #fdf4f5;
  position: relative;
}
.login-card__form::after {
  content: '';
  position: absolute;
  inset: 1.5rem;
  border-radius: 36px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  pointer-events: none;
}
.showcase-blob {
  position: relative;
  width: 100%;
  max-width: 360px;
  margin: 0 auto 2rem;
  aspect-ratio: 4 / 3;
}
.showcase-blob::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(239, 155, 155, 0.45), transparent 55%),
    radial-gradient(circle at 70% 60%, rgba(211, 67, 67, 0.45), transparent 55%);
  border-radius: 50% 40% 50% 60% / 40% 60% 40% 60%;
  z-index: 1;
}
.showcase-blob__halo {
  position: absolute;
  inset: 12%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  filter: blur(14px);
  z-index: 0;
}
.showcase-blob__tree {
  position: absolute;
  inset: 20% 25% 12% 25%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 2;
  animation: sway 9s ease-in-out infinite;
}
.tree.trunk {
  position: absolute;
  bottom: 0;
  width: 14px;
  height: 60px;
  background: #5b2c1a;
  border-radius: 999px;
}
.tree.leaf {
  position: absolute;
  width: 120px;
  height: 120px;
  background: linear-gradient(145deg, #b51f42, #7e1025);
  border-radius: 50% 50% 42% 42%;
  box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.15);
}
.tree.leaf-1 {
  bottom: 40px;
}
.tree.leaf-2 {
  width: 90px;
  height: 90px;
  bottom: 80px;
  transform: translateY(-10px);
}
.tree.leaf-3 {
  width: 60px;
  height: 60px;
  bottom: 115px;
  transform: translateY(-14px);
}
.showcase-blob__ornaments .bubble {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #fde047;
  box-shadow: 0 0 8px rgba(255, 216, 102, 0.5);
  animation: float 4s ease-in-out infinite;
}
.showcase-blob__ornaments .bubble:nth-child(1) {
  top: 35%;
  left: 40%;
}
.showcase-blob__ornaments .bubble:nth-child(2) {
  top: 50%;
  left: 60%;
  animation-delay: 0.5s;
}
.showcase-blob__ornaments .bubble:nth-child(3) {
  top: 62%;
  left: 35%;
  animation-delay: 1s;
}
.showcase-blob__ornaments .bubble:nth-child(4) {
  top: 55%;
  left: 48%;
  animation-delay: 1.6s;
}
.showcase-blob__ornaments .bubble:nth-child(5) {
  top: 32%;
  left: 55%;
  animation-delay: 2.2s;
}
.showcase-blob__sled {
  position: absolute;
  top: 8%;
  right: 16%;
  background: rgba(181, 31, 66, 0.15);
  padding: 0.75rem;
  border-radius: 16px;
  z-index: 3;
}
.showcase-meta {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
}
.showcase-logo {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  border: 3px solid rgba(181, 31, 66, 0.15);
}
.login-card__form :deep(.u-input) {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: transparent;
  backdrop-filter: blur(8px);
  color: #fdf4f5;
}
.login-card__form :deep(.u-input:focus-within) {
  border-color: rgba(255, 255, 255, 0.35);
}
.login-card__form :deep(.u-button) {
  border-radius: 999px;
  background: linear-gradient(90deg, #dc2626, #f87171);
  border: none;
}
.login-card__form :deep(.u-checkbox-label) {
  color: rgba(255, 255, 255, 0.7);
}
@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
  100% {
    transform: translateY(0);
  }
}
@keyframes sway {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-3px) rotate(-1.5deg);
  }
  100% {
    transform: translateY(0) rotate(0deg);
  }
}
@media (max-width: 960px) {
  .login-card__inner {
    border-radius: 28px;
    overflow: visible;
  }
  .login-card__curve {
    display: none;
  }
  .login-card__form::after {
    inset: 1rem;
    border-radius: 28px;
  }
  .showcase-meta {
    flex-direction: column;
  }
}
</style>
