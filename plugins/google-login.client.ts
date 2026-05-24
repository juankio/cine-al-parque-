import vue3GoogleLogin from 'vue3-google-login'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  
  if (config.public.googleClientId) {
    nuxtApp.vueApp.use(vue3GoogleLogin, {
      clientId: config.public.googleClientId
    })
  } else {
    console.warn('Google Client ID no encontrado. El login de Google no funcionará.')
  }
})
