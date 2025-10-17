<template>
  <div class="bg-white dark:bg-surface rounded-2xl shadow border border-theme p-6">
    <div class="mb-6 text-center">
      <h1 class="text-2xl font-bold text-foreground">Crear cuenta</h1>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">Cine al Parque</p>
    </div>

    <form autocomplete="on" @submit.prevent="onSubmit" class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium mb-1">Nombre</label>
        <input
          id="name"
          name="name"
          v-model.trim="name"
          autocomplete="name"
          required
          class="w-full rounded-xl border border-theme px-3 py-2 bg-surface text-foreground"
        />
      </div>

      <div>
        <label for="email" class="block text-sm font-medium mb-1">Correo</label>
        <input
          id="email"
          name="email"
          v-model.trim="email"
          type="email"
          inputmode="email"
          autocomplete="email"
          required
          class="w-full rounded-xl border border-theme px-3 py-2 bg-surface text-foreground"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium mb-1">Contraseña</label>
        <input
          id="password"
          name="password"
          v-model="password"
          :type="show ? 'text' : 'password'"
          autocomplete="new-password"
          required
          class="w-full rounded-xl border border-theme px-3 py-2 bg-surface text-foreground"
        />
      </div>

      <div>
        <label for="confirm" class="block text-sm font-medium mb-1"
          >Confirmar contraseña</label
        >
        <input
          id="confirm"
          name="confirm"
          v-model="confirm"
          :type="show ? 'text' : 'password'"
          autocomplete="new-password"
          required
          class="w-full rounded-xl border border-theme px-3 py-2 bg-surface text-foreground"
        />
        <button
          type="button"
          @click="show = !show"
          class="text-xs mt-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          {{ show ? "Ocultar" : "Ver" }} contraseña
        </button>
      </div>

      <button
        :disabled="loading"
        type="submit"
        class="w-full rounded-xl py-2 font-semibold bg-red-500 disabled:opacity-60"
      >
        <span v-if="!loading">Registrarme</span>
        <span v-else>Creando…</span>
      </button>

      <p v-if="errMsg" class="text-sm text-red-500">{{ errMsg }}</p>
    </form>

    <p class="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
      ¿Ya tienes cuenta?
      <NuxtLink to="/login" class="text-brand hover:underline">Inicia sesión</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "#imports";
import { useAuth } from "~/composables/useAuth";
import { validateRegister } from "~/utils/validators";

definePageMeta({ layout: "auth" });

const router = useRouter();
const { register, loading, error } = useAuth();

const name = ref("");
const email = ref("");
const password = ref("");
const confirm = ref("");
const show = ref(false);
const errMsg = computed(() => (typeof error.value === "string" ? error.value : ""));

const onSubmit = async () => {
  const v = validateRegister(name.value, email.value, password.value, confirm.value);
  if (v) return alert(v);
  try {
    await register({ name: name.value, email: email.value, password: password.value });
    router.push("/");
  } catch {}
};
</script>
