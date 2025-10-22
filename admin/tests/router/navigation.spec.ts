import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Create a test router with auth guards
function createTestRouter() {
  const routes = [
    {
      path: '/login',
      name: 'Login',
      component: { template: '<div>Login</div>' },
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: { template: '<div>Layout</div>' },
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: { template: '<div>Dashboard</div>' },
          meta: { title: '仪表盘' }
        },
        {
          path: 'pages',
          name: 'PageList',
          component: { template: '<div>Pages</div>' },
          meta: { title: '页面列表' }
        }
      ]
    }
  ]

  const router = createRouter({
    history: createMemoryHistory(),
    routes
  })

  // Add navigation guard (simplified version of actual guard)
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    const requiresAuth = to.meta.requiresAuth !== false

    if (requiresAuth) {
      if (!authStore.isAuthenticated) {
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      } else {
        next()
      }
    } else {
      if (to.path === '/login' && authStore.isAuthenticated) {
        next('/')
      } else {
        next()
      }
    }
  })

  return router
}

describe('Router Navigation', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    localStorage.clear()
  })

  describe('Route Guards', () => {
    it('should redirect to login when accessing protected route without auth', async () => {
      const router = createTestRouter()
      const authStore = useAuthStore()

      // Ensure not authenticated
      authStore.isAuthenticated = false

      await router.push('/dashboard')

      expect(router.currentRoute.value.path).toBe('/login')
      expect(router.currentRoute.value.query.redirect).toBe('/dashboard')
    })

    it('should allow access to protected routes when authenticated', async () => {
      const router = createTestRouter()
      const authStore = useAuthStore()

      // Set authenticated state
      authStore.isAuthenticated = true
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'admin'
      }

      await router.push('/dashboard')

      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('should redirect authenticated users from login to home', async () => {
      const router = createTestRouter()
      const authStore = useAuthStore()

      authStore.isAuthenticated = true
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'admin'
      }

      await router.push('/login')

      // Root path redirects to /dashboard
      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('should allow unauthenticated users to access login page', async () => {
      const router = createTestRouter()
      const authStore = useAuthStore()

      authStore.isAuthenticated = false

      await router.push('/login')

      expect(router.currentRoute.value.path).toBe('/login')
    })
  })

  describe('Route Metadata', () => {
    it('should have correct meta for dashboard route', async () => {
      const router = createTestRouter()
      const authStore = useAuthStore()

      authStore.isAuthenticated = true
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'admin'
      }

      await router.push('/dashboard')

      const route = router.currentRoute.value
      expect(route.meta.title).toBe('仪表盘')
    })

    it('should have requiresAuth set correctly', async () => {
      const router = createTestRouter()

      const loginRoute = router.resolve({ name: 'Login' })
      expect(loginRoute.meta.requiresAuth).toBe(false)

      const dashboardRoute = router.resolve({ name: 'Dashboard' })
      expect(dashboardRoute.meta.requiresAuth).not.toBe(false)
    })
  })

  describe('Navigation Flow', () => {
    it('should handle redirect after login', async () => {
      const router = createTestRouter()
      const authStore = useAuthStore()

      // Try to access protected route when not authenticated
      authStore.isAuthenticated = false
      await router.push('/pages')

      // Should redirect to login with query parameter
      expect(router.currentRoute.value.path).toBe('/login')
      expect(router.currentRoute.value.query.redirect).toBe('/pages')

      // Simulate login
      authStore.isAuthenticated = true
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'admin'
      }

      // Navigate to the redirect target
      const redirectPath = router.currentRoute.value.query.redirect as string
      await router.push(redirectPath || '/dashboard')

      // Should now be on the original target page
      expect(router.currentRoute.value.path).toBe('/pages')
    })

    it('should redirect root to dashboard', async () => {
      const router = createTestRouter()
      const authStore = useAuthStore()

      authStore.isAuthenticated = true
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'admin'
      }

      await router.push('/')

      expect(router.currentRoute.value.path).toBe('/dashboard')
    })
  })

  describe('Route Names', () => {
    it('should have correct route names registered', () => {
      const router = createTestRouter()

      const routes = router.getRoutes()
      const routeNames = routes.map(r => r.name).filter(Boolean)

      expect(routeNames).toContain('Login')
      expect(routeNames).toContain('Dashboard')
      expect(routeNames).toContain('PageList')
    })

    it('should navigate using route names', async () => {
      const router = createTestRouter()
      const authStore = useAuthStore()

      authStore.isAuthenticated = true
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'admin'
      }

      await router.push({ name: 'PageList' })

      expect(router.currentRoute.value.name).toBe('PageList')
    })
  })
})
