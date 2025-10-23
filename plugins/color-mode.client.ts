// plugins/color-mode.client.ts
export default defineNuxtPlugin(() => {
    const colorMode = useColorMode()

    // aplicar al montar
    document.documentElement.classList.toggle('dark', colorMode.value === 'dark')

    // observar cambios y volver a aplicar
    watch(
        () => colorMode.value,
        (val) => {
            document.documentElement.classList.toggle('dark', val === 'dark')
        },
        { immediate: false }
    )
})
