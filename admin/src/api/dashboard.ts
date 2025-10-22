import { http } from '@/utils/request'
import type { DashboardStats, RecentActivity } from '@/types/dashboard'

export function getDashboardStats(): Promise<DashboardStats> {
  return http.get('/dashboard/stats')
}

export function getRecentActivity(limit?: number): Promise<RecentActivity[]> {
  return http.get('/dashboard/activity', { params: { limit } })
}
