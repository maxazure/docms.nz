import { http } from '@/utils/request'
import type { User, RolePermissions, ListResponse } from '@/types'

export interface UserListQuery {
  page?: number
  limit?: number
  search?: string
  role?: string
}

export interface CreateUserData {
  email: string
  password: string
  displayName: string
  role: string
}

export interface UpdateUserData {
  email?: string
  password?: string
  displayName?: string
  role?: string
}

// Get user list with pagination and filters
export async function getUserList(params?: UserListQuery): Promise<ListResponse<User>> {
  const response = await http.get<any>('/users', { params })
  return response.data.data
}

// Get single user by ID
export async function getUser(id: string): Promise<User> {
  const response = await http.get<any>(`/users/${id}`)
  return response.data.data
}

// Create new user
export async function createUser(data: CreateUserData): Promise<User> {
  const response = await http.post<any>('/users', data)
  return response.data.data
}

// Update user
export async function updateUser(id: string, data: UpdateUserData): Promise<User> {
  const response = await http.put<any>(`/users/${id}`, data)
  return response.data.data
}

// Delete user
export async function deleteUser(id: string): Promise<void> {
  await http.delete(`/users/${id}`)
}

// Toggle user active status
export async function toggleUserActive(id: string): Promise<User> {
  const response = await http.post<any>(`/users/${id}/toggle-active`)
  return response.data.data
}

// Get role permissions (future feature)
export async function getRolePermissions(): Promise<RolePermissions[]> {
  const response = await http.get<any>('/permissions')
  return response.data.data
}

// Update role permissions (future feature)
export async function updateRolePermissions(role: string, permissions: any): Promise<RolePermissions> {
  const response = await http.put<any>(`/permissions/${role}`, permissions)
  return response.data.data
}

// Update user profile
export async function updateUserProfile(data: {
  displayName?: string
  avatar?: string
}): Promise<User> {
  const response = await http.put<any>('/auth/profile', data)
  return response.data.data
}

// Change password
export async function changePassword(data: {
  oldPassword: string
  newPassword: string
}): Promise<void> {
  await http.post('/auth/change-password', data)
}

// Reset user password (admin only)
export async function resetUserPassword(id: string, data: {
  newPassword: string
}): Promise<void> {
  await http.post(`/users/${id}/reset-password`, data)
}
