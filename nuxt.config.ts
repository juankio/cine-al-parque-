export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: '.',
  ssr: false,

  modules: ['@pinia/nuxt', '@vite-pwa/nuxt', '@nuxtjs/color-mode', '@nuxt/ui'],

  css: ['~/assets/css/main.css'],

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
    authSecret: process.env.AUTH_SECRET || '',
    adminEmails: process.env.NUXT_ADMIN_EMAILS || '',
    holdsTtlMinutes: process.env.HOLDS_TTL_MIN || '10',
    public: {}
  },

  app: {
    head: {
      title: 'Cine al Parque',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: `data:image/svg+xml,${svgIcon}` }]
    }
  },

  colorMode: {
    preference: 'system',
    fallback: 'dark',
    classSuffix: '' // ← pone la clase 'dark' en <html>
  },
  components: [
    { path: '~/components', pathPrefix: false },
    { path: '~/components/base', pathPrefix: false },
    { path: '~/components/shared', pathPrefix: false },
    { path: '~/components/boss', pathPrefix: false },

  ],
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {} // ← v4 usa ESTE nombre, no "tailwindcss"
    }
  }
})
