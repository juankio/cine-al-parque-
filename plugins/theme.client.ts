export default defineNuxtPlugin(() => {
    if (process.server) return
    const KEY = 'cine.theme' // 'light' | 'dark'

    const apply = (mode: 'light' | 'dark') => {
        const html = document.documentElement
        if (mode === 'dark') html.classList.add('dark', 'darkmode')
        else html.classList.remove('dark', 'darkmode')
        html.classList.toggle('dark', mode === 'dark')
        html.classList.toggle('darkmode', mode === 'dark')
        localStorage.setItem(KEY, mode)
    }

    // init
    const saved = localStorage.getItem(KEY) as 'light' | 'dark' | null
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    apply(saved ?? prefers)

    // Exponer toggle simple
    // @ts-ignore
    window.__toggleTheme = () => {
        const curr = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
        apply(curr === 'dark' ? 'light' : 'dark')
    }
})
