export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: '.',
  ssr: false,

  modules: [
    "@nuxt/eslint",'@pinia/nuxt', '@vite-pwa/nuxt', '@nuxtjs/color-mode', '@nuxt/ui'],

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
    public: {
      googleClientId: process.env.GOOGLE_CLIENT_ID || ''
    }
  },

  routeRules: {
    '/**': {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
      }
    }
  },

  app: {
    head: {
      title: 'Cine al Parque',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: "data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%23E11D48\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"%3E%3Cpath d=\"M19.82 2H4.18C2.976 2 2 2.976 2 4.18v15.64C2 21.024 2.976 22 4.18 22h15.64c1.204 0 2.18-.976 2.18-2.18V4.18C22 2.976 21.024 2 19.82 2Z\"%3E%3C/path%3E%3Cpath d=\"M7 2v20\"%3E%3C/path%3E%3Cpath d=\"M17 2v20\"%3E%3C/path%3E%3Cpath d=\"M2 12h20\"%3E%3C/path%3E%3Cpath d=\"M2 7h5\"%3E%3C/path%3E%3Cpath d=\"M2 17h5\"%3E%3C/path%3E%3Cpath d=\"M17 17h5\"%3E%3C/path%3E%3Cpath d=\"M17 7h5\"%3E%3C/path%3E%3C/svg%3E" }]
    }
  },

  colorMode: {
    preference: 'dark',
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
  },
  vite: {
    optimizeDeps: {
      include: ['zod', 'animejs']
    }
  }
})
