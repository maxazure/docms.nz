import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar'
          ]
        }
      ],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true
      }
    }),
    Components({
      resolvers: [NaiveUiResolver()],
      dts: 'src/components.d.ts'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/menu-items': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/pages': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/posts': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/products': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/media': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/categories': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/tags': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/forms': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/site': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/users': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/search': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/blocks': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
