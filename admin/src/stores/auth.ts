import { defineStore } from 'pinia'
import { authApi } from '@/api'
import type { User, LoginRequest } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
    isAuthenticated: !!localStorage.getItem('access_token')
  }),

  getters: {
    // 获取当前用户
    currentUser: (state) => state.user,
    
    // 是否已登录
    isLoggedIn: (state) => state.isAuthenticated && !!state.user,
    
    // 获取用户角色
    userRole: (state) => state.user?.role
  },

  actions: {
    // 登录
    async login(credentials: LoginRequest) {
      try {
        const response = await authApi.login(credentials)
        
        if (response.success && response.data) {
          const { accessToken, refreshToken, user } = response.data
          
          // 保存 token
          this.accessToken = accessToken
          this.refreshToken = refreshToken
          this.user = user
          this.isAuthenticated = true
          
          // 持久化到 localStorage
          localStorage.setItem('access_token', accessToken)
          localStorage.setItem('refresh_token', refreshToken)
          
          return { success: true, user }
        }
        
        return { success: false, error: response.message || '登录失败' }
      } catch (error: any) {
        console.error('Login error:', error)
        return { success: false, error: error.message || '登录失败' }
      }
    },

    // 退出登录
    async logout() {
      try {
        await authApi.logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // 清除状态和本地存储
        this.user = null
        this.accessToken = null
        this.refreshToken = null
        this.isAuthenticated = false
        
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    },

    // 获取用户信息
    async fetchUserProfile() {
      try {
        const response = await authApi.getProfile()
        
        if (response.success && response.data) {
          this.user = response.data
          this.isAuthenticated = true
          return { success: true, user: response.data }
        }
        
        return { success: false }
      } catch (error: any) {
        console.error('Fetch profile error:', error)
        // 如果获取失败，可能是 token 过期，清除登录状态
        this.logout()
        return { success: false, error: error.message }
      }
    },

    // 刷新 Token
    async refreshAccessToken() {
      if (!this.refreshToken) {
        return { success: false, error: '没有刷新令牌' }
      }

      try {
        const response = await authApi.refreshToken({
          refreshToken: this.refreshToken
        })
        
        if (response.success && response.data) {
          const { accessToken, refreshToken } = response.data
          
          this.accessToken = accessToken
          this.refreshToken = refreshToken
          
          localStorage.setItem('access_token', accessToken)
          localStorage.setItem('refresh_token', refreshToken)
          
          return { success: true }
        }
        
        return { success: false }
      } catch (error: any) {
        console.error('Refresh token error:', error)
        this.logout()
        return { success: false, error: error.message }
      }
    },

    // 初始化认证状态（应用启动时调用）
    async init() {
      if (this.accessToken) {
        await this.fetchUserProfile()
      }
    }
  }
})
