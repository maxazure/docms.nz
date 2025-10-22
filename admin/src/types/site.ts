/**
 * Site Types
 * 站点设置相关类型定义
 */

export interface SiteSettings {
  id: string
  name: string
  description?: string
  logo?: string
  favicon?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  socialLinks?: SocialLink[]
  seo: SeoSettings
  theme: ThemeSettings
  updatedAt?: string
}

export interface SocialLink {
  platform: 'wechat' | 'weibo' | 'linkedin' | 'facebook' | 'twitter' | 'youtube'
  url: string
}

export interface SeoSettings {
  defaultTitle: string
  titleTemplate?: string
  defaultDescription: string
  defaultKeywords?: string[]
  ogImage?: string
}

export interface ThemeSettings {
  primaryColor: string
  accentColor: string
  fontFamily?: string
  customCss?: string
}
