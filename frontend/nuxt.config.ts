// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // 运行时配置
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:5173',
    },
  },

  // 自动导入配置
  imports: {
    dirs: ['composables/**'],
  },

  // 组件自动导入
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  // CSS 配置
  css: ['~/assets/css/main.css'],

  // TypeScript 配置
  typescript: {
    strict: true,
    typeCheck: false, // 暂时禁用类型检查，避免需要 vue-tsc
  },

  // 开发服务器配置
  devServer: {
    port: 5173,
    host: '0.0.0.0',
  },

  // 实验性特性
  experimental: {
    payloadExtraction: false,
  },

  // 生产构建配置
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },
})
