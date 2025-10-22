/**
 * Audit Types
 * 审计日志相关类型定义
 */

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: AuditAction
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'unpublish'
  | 'login'
  | 'logout'

export interface AuditLogQuery {
  page?: number
  limit?: number
  userId?: string
  action?: AuditAction
  resource?: string
  startDate?: string
  endDate?: string
}
