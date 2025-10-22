// API 响应基础类型
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 用户角色
export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  AUTHOR = 'AUTHOR',
  VIEWER = 'VIEWER'
}

// 用户信息
export interface User {
  id: string
  email: string
  displayName: string
  role: UserRole
  createdAt: string
}

// 登录请求
export interface LoginRequest {
  email: string
  password: string
}

// 登录响应
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

// 注册请求
export interface RegisterRequest {
  email: string
  password: string
  displayName: string
}

// Token 刷新请求
export interface RefreshTokenRequest {
  refreshToken: string
}

// 内容状态
export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published'
}

// 菜单项类型
export enum MenuItemType {
  PAGE = 'page',
  POST_LIST = 'postList',
  PRODUCT = 'product'
}

// 链接类型
export enum LinkType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  CUSTOM = 'custom'
}

// 错误响应
export interface ErrorResponse {
  success: false
  error: string
  message: string
  statusCode?: number
}
