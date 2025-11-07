// plugins/color-mode.client.ts
import { watch } from 'vue'

const applyColorScheme = (mode: string) => {
  const root = document.documentElement
  const isDark = mode === 'dark'

  root.classList.toggle('dark', isDark)
  root.dataset.theme = isDark ? 'dark' : 'light'
  root.style.colorScheme = isDark ? 'dark' : 'light'
}

export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()

  // aplicar el valor actual apenas se hidrata la app
  applyColorScheme(colorMode.value)

  // mantener <html> sincronizado cuando el usuario cambia el modo
  watch(
    () => colorMode.value,
    (val) => {
      applyColorScheme(val)
    },
    { immediate: true }
  )
})
