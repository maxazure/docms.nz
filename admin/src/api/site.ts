import { http } from '@/utils/request'
import type { SiteSettings } from '@/types/site'

export function getSiteSettings(): Promise<SiteSettings> {
  return http.get('/site/settings')
}

export function updateSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  return http.put('/site/settings', data)
}
