import { http } from '@/utils/request'

export interface Site {
  id: string
  name: string
  domain: string
  locale: string
  themeTokens: Record<string, any>
  settings: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface UpdateSiteDto {
  name?: string
  domain?: string
  locale?: string
  settings?: Record<string, any>
}

export interface ThemeTokenDto {
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  [key: string]: any
}

// 获取站点配置
export async function getSite(): Promise<Site> {
  const response = await http.get<any>('/site')
  return response.data.data
}

// 更新站点配置
export async function updateSite(data: UpdateSiteDto): Promise<Site> {
  const response = await http.put<any>('/site', data)
  return response.data.data
}

// 更新主题配置
export async function updateTheme(data: ThemeTokenDto): Promise<any> {
  const response = await http.put<any>('/site/theme', data)
  return response.data.data
}

// 获取主题配置结构
export async function getThemeSchema(): Promise<any> {
  const response = await http.get<any>('/site/theme/schema')
  return response.data.data
}
