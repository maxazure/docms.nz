import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'
import type { ApiResponse, ErrorResponse } from '@/types'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    
    // 如果返回的状态码为 200，说明接口请求成功
    if (response.status === 200 || response.status === 201) {
      return response
    }
    
    // 其他状态码都当作错误处理
    console.error('Response error:', res)
    return Promise.reject(new Error(res.message || 'Error'))
  },
  async (error: AxiosError<ErrorResponse>) => {
    console.error('Response error:', error)
    
    // 处理 401 未授权错误
    if (error.response?.status === 401) {
      // 尝试刷新 token
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const response = await axios.post('/auth/refresh', {
            refreshToken
          })
          
          if (response.data.success && response.data.data.accessToken) {
            // 保存新的 token
            localStorage.setItem('access_token', response.data.data.accessToken)
            
            // 重新发起原请求
            if (error.config) {
              error.config.headers.Authorization = `Bearer ${response.data.data.accessToken}`
              return request(error.config)
            }
          }
        } catch (refreshError) {
          // 刷新失败，清除 token 并跳转到登录页
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      } else {
        // 没有 refresh token，直接跳转到登录页
        localStorage.removeItem('access_token')
        window.location.href = '/login'
      }
    }
    
    // 处理其他错误
    const message = error.response?.data?.message || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

// 封装请求方法
export const http = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return request.get(url, config)
  },
  
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return request.post(url, data, config)
  },
  
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return request.put(url, data, config)
  },
  
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return request.delete(url, config)
  },
  
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return request.patch(url, data, config)
  }
}

export default request
