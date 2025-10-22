/**
 * User Types
 * 用户管理相关类型定义
 */

export type UserRole = 'owner' | 'admin' | 'editor' | 'author' | 'viewer'

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: UserRole
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt?: string
}

export interface RolePermissions {
  role: UserRole
  permissions: Permission[]
}

export interface Permission {
  resource: string
  actions: ('view' | 'create' | 'update' | 'delete' | 'publish')[]
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 100,
  admin: 80,
  editor: 60,
  author: 40,
  viewer: 20
}
