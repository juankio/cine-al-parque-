export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: '.',
  ssr: false,
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@vite-pwa/nuxt'],
  tailwindcss: { viewer: false },
  css: ['~/assets/css/tailwind.css'],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Cine al Parque',
      short_name: 'Cine',
      theme_color: '#111827',
      background_color: '#111827',
      display: 'standalone',
      start_url: '/',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    }
  },
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || '',
    public: {}
  },
  app: {
    head: {
      title: 'Cine al Parque',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }]
    }
  }

})
