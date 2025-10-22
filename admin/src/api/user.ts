import { http } from '@/utils/request'
import type { User, RolePermissions, ListResponse } from '@/types'

export function getUserList(params?: any): Promise<ListResponse<User>> {
  return http.get('users', { params })
}

export function getUser(id: string): Promise<User> {
  return http.get(`/api/users/${id}`)
}

export function createUser(data: Partial<User>): Promise<User> {
  return http.post('users', data)
}

export function updateUser(id: string, data: Partial<User>): Promise<User> {
  return http.put(`/api/users/${id}`, data)
}

export function deleteUser(id: string): Promise<void> {
  return http.delete(`/api/users/${id}`)
}

export function toggleUserActive(id: string): Promise<User> {
  return http.post(`/api/users/${id}/toggle-active`)
}

export function getRolePermissions(): Promise<RolePermissions[]> {
  return http.get('roles/permissions')
}

export function updateRolePermissions(role: string, permissions: any): Promise<RolePermissions> {
  return http.put(`/api/roles/${role}/permissions`, permissions)
}
