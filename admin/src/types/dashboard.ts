/**
 * Dashboard Types
 * 仪表盘相关类型定义
 */

export interface DashboardStats {
  contentStats: ContentStats
  recentActivity: RecentActivity[]
  quickLinks: QuickLink[]
}

export interface ContentStats {
  pages: { total: number; published: number; draft: number }
  posts: { total: number; published: number; draft: number }
  products: { total: number; active: number; inactive: number }
  media: { total: number; size: number }
  forms: { total: number; submissions: number }
}

export interface RecentActivity {
  id: string
  type: 'create' | 'update' | 'publish'
  resource: string
  resourceName: string
  userName: string
  createdAt: string
}

export interface QuickLink {
  label: string
  icon: string
  route: string
  badge?: number
}
