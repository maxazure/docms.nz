import { http } from '@/utils/request'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  User
} from '@/types'

// 认证 API
export const authApi = {
  // 用户登录
  async login(data: LoginRequest) {
    const response = await http.post<LoginResponse>('/auth/login', data)
    return response.data
  },

  // 用户注册
  async register(data: RegisterRequest) {
    const response = await http.post<User>('/auth/register', data)
    return response.data
  },

  // 刷新 Token
  async refreshToken(data: RefreshTokenRequest) {
    const response = await http.post<LoginResponse>('/auth/refresh', data)
    return response.data
  },

  // 退出登录
  async logout() {
    const response = await http.post('/auth/logout')
    return response.data
  },

  // 获取当前用户信息
  async getProfile() {
    const response = await http.get<User>('/auth/profile')
    return response.data
  },

  // 重置密码
  async resetPassword(email: string) {
    const response = await http.post('/auth/reset-password', { email })
    return response.data
  }
}
