// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',

  devtools: { enabled: true },

  // Enable pages
  pages: true,

  // SSR/SSG Configuration
  ssr: true,

  // Runtime config for environment variables
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || '绿野水培 - 专业水培设备供应商',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3003',
    }
  },

  // App config
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Docms - Enterprise CMS',
      meta: [
        { name: 'description', content: 'Professional enterprise CMS solution' }
      ],
    },
  },

  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
  ],

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: false,  // Disable type checking to avoid vue-tsc dependency
  },

  // Build optimization
  nitro: {
    preset: 'node-server',
  },

  // Dev server
  devServer: {
    port: 3001,
    host: '0.0.0.0'
  }
})
