import { http } from '@/utils/request'
import type { AuditLog, AuditLogQuery, ListResponse } from '@/types'

export function getAuditLogs(params?: AuditLogQuery): Promise<ListResponse<AuditLog>> {
  return http.get('/audit/logs', { params })
}

export function getAuditLog(id: string): Promise<AuditLog> {
  return http.get(`/audit/logs/${id}`)
}
