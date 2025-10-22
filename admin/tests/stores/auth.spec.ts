import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '@/stores/auth'
import { createTestPinia, mockApiResponse } from '../utils/test-utils'
import * as authApi from '@/api/auth'

// Mock the auth API
vi.mock('@/api/auth', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
    refreshToken: vi.fn()
  }
}))

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset Pinia and localStorage before each test
    createTestPinia()
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state when no tokens in localStorage', () => {
      const store = useAuthStore()

      expect(store.user).toBeNull()
      expect(store.accessToken).toBeNull()
      expect(store.refreshToken).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should restore state from localStorage', () => {
      localStorage.setItem('access_token', 'test-access-token')
      localStorage.setItem('refresh_token', 'test-refresh-token')

      const store = useAuthStore()

      expect(store.accessToken).toBe('test-access-token')
      expect(store.refreshToken).toBe('test-refresh-token')
      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('Getters', () => {
    it('currentUser should return user object', () => {
      const store = useAuthStore()
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'admin' as const
      }

      store.user = mockUser

      expect(store.currentUser).toEqual(mockUser)
    })

    it('isLoggedIn should return true when authenticated with user', () => {
      const store = useAuthStore()
      store.isAuthenticated = true
      store.user = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'admin'
      }

      expect(store.isLoggedIn).toBe(true)
    })

    it('isLoggedIn should return false when not authenticated', () => {
      const store = useAuthStore()

      expect(store.isLoggedIn).toBe(false)
    })

    it('userRole should return user role', () => {
      const store = useAuthStore()
      store.user = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'editor'
      }

      expect(store.userRole).toBe('editor')
    })
  })

  describe('Actions - Login', () => {
    it('should login successfully and save tokens', async () => {
      const store = useAuthStore()
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'admin' as const
      }

      const mockResponse = mockApiResponse({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: mockUser
      })

      vi.spyOn(authApi.authApi, 'login').mockResolvedValue(mockResponse)

      const result = await store.login({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(store.accessToken).toBe('new-access-token')
      expect(store.refreshToken).toBe('new-refresh-token')
      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
      expect(localStorage.getItem('access_token')).toBe('new-access-token')
      expect(localStorage.getItem('refresh_token')).toBe('new-refresh-token')
    })

    it('should handle login failure', async () => {
      const store = useAuthStore()
      const mockResponse = {
        success: false,
        data: null,
        message: 'Invalid credentials'
      }

      vi.spyOn(authApi.authApi, 'login').mockResolvedValue(mockResponse)

      const result = await store.login({
        email: 'wrong@example.com',
        password: 'wrong'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
      expect(store.isAuthenticated).toBe(false)
      expect(store.user).toBeNull()
    })

    it('should handle login error', async () => {
      const store = useAuthStore()

      vi.spyOn(authApi.authApi, 'login').mockRejectedValue(
        new Error('Network error')
      )

      const result = await store.login({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('Actions - Logout', () => {
    it('should clear auth state and localStorage on logout', async () => {
      const store = useAuthStore()

      // Set up authenticated state
      store.user = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'admin'
      }
      store.accessToken = 'token'
      store.refreshToken = 'refresh'
      store.isAuthenticated = true
      localStorage.setItem('access_token', 'token')
      localStorage.setItem('refresh_token', 'refresh')

      vi.spyOn(authApi.authApi, 'logout').mockResolvedValue({
        success: true,
        data: null
      })

      await store.logout()

      expect(store.user).toBeNull()
      expect(store.accessToken).toBeNull()
      expect(store.refreshToken).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
    })

    it('should clear state even if API call fails', async () => {
      const store = useAuthStore()

      store.accessToken = 'token'
      store.isAuthenticated = true

      vi.spyOn(authApi.authApi, 'logout').mockRejectedValue(
        new Error('Network error')
      )

      await store.logout()

      expect(store.isAuthenticated).toBe(false)
      expect(store.accessToken).toBeNull()
    })
  })

  describe('Actions - Fetch Profile', () => {
    it('should fetch and set user profile', async () => {
      const store = useAuthStore()
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'admin' as const
      }

      const mockResponse = mockApiResponse(mockUser)

      vi.spyOn(authApi.authApi, 'getProfile').mockResolvedValue(mockResponse)

      const result = await store.fetchUserProfile()

      expect(result.success).toBe(true)
      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
    })

    it('should logout on profile fetch failure', async () => {
      const store = useAuthStore()
      store.accessToken = 'invalid-token'

      vi.spyOn(authApi.authApi, 'getProfile').mockRejectedValue(
        new Error('Unauthorized')
      )

      const logoutSpy = vi.spyOn(store, 'logout')

      const result = await store.fetchUserProfile()

      expect(result.success).toBe(false)
      expect(logoutSpy).toHaveBeenCalled()
    })
  })

  describe('Actions - Refresh Token', () => {
    it('should refresh access token successfully', async () => {
      const store = useAuthStore()
      store.refreshToken = 'old-refresh-token'

      const mockResponse = mockApiResponse({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      })

      vi.spyOn(authApi.authApi, 'refreshToken').mockResolvedValue(mockResponse)

      const result = await store.refreshAccessToken()

      expect(result.success).toBe(true)
      expect(store.accessToken).toBe('new-access-token')
      expect(store.refreshToken).toBe('new-refresh-token')
      expect(localStorage.getItem('access_token')).toBe('new-access-token')
      expect(localStorage.getItem('refresh_token')).toBe('new-refresh-token')
    })

    it('should fail when no refresh token exists', async () => {
      const store = useAuthStore()
      store.refreshToken = null

      const result = await store.refreshAccessToken()

      expect(result.success).toBe(false)
      expect(result.error).toBe('没有刷新令牌')
    })

    it('should logout on refresh token failure', async () => {
      const store = useAuthStore()
      store.refreshToken = 'invalid-refresh-token'

      vi.spyOn(authApi.authApi, 'refreshToken').mockRejectedValue(
        new Error('Invalid refresh token')
      )

      const logoutSpy = vi.spyOn(store, 'logout')

      const result = await store.refreshAccessToken()

      expect(result.success).toBe(false)
      expect(logoutSpy).toHaveBeenCalled()
    })
  })
})
