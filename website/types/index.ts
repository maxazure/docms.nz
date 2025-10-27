// API Response Types
export interface ApiResponse<T> {
  data: T
  meta?: any
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Site Types
export interface Site {
  id: number
  name: string
  domain: string
  locale: string
  themeTokens: ThemeTokens
  settings: SiteSettings
  createdAt: string
  updatedAt?: string
}

export interface ThemeTokens {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  fontSize: string
  borderRadius: string
  boxShadow: string
  spacing: string
}

export interface SiteSettings {
  logo?: string
  favicon?: string
  icp?: string
  socialMedia?: {
    wechat?: string
    weibo?: string
    douyin?: string
  }
  contact?: {
    email?: string
    phone?: string
    address?: string
  }
}

// Menu Types
export interface MenuItem {
  id: number
  menuCode: string
  label: string
  slug: string
  type: 'PAGE' | 'POST_LIST' | 'PRODUCT'
  linkType: 'internal' | 'external' | 'custom'
  linkTarget?: string
  parentId?: number
  order: number
  icon?: string
  isVisible: boolean
  isActive: boolean
  children?: MenuItem[]
}

// Page Types
export interface Page {
  id: number
  menuItemId?: number
  title: string
  slug: string
  blocks: Block[]
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt?: string
  meta?: SEOMeta
  createdAt: string
  updatedAt?: string
}

// Block Types
export interface Block {
  id: string
  type: BlockType
  props: any
  order: number
  visibility: boolean
}

export type BlockType =
  | 'hero'
  | 'text'
  | 'imageGallery'
  | 'features'
  | 'cta'
  | 'faq'
  | 'productShowcase'
  | 'testimonials'
  | 'contactForm'
  | 'map'
  | 'video'
  | 'divider'

// Post Types
export interface Post {
  id: number
  menuItemId?: number
  title: string
  slug: string
  summary?: string
  content: any
  coverImageId?: number
  coverImage?: Media
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt?: string
  authorId: number
  author?: User
  categories?: Category[]
  tags?: Tag[]
  meta?: SEOMeta
  createdAt: string
  updatedAt?: string
}

// Product Types
export interface Product {
  id: number
  menuItemId?: number
  name: string
  slug: string
  summary?: string
  description: any
  specs?: Record<string, any>
  gallery?: string[]
  galleryMedia?: Media[]
  price?: number
  categoryId?: number
  category?: Category
  tags?: Tag[]
  isActive: boolean
  isFeatured: boolean
  meta?: SEOMeta
  createdAt: string
  updatedAt?: string
}

// Media Types
export interface Media {
  id: number
  filename: string
  mime: string
  size: number
  width?: number
  height?: number
  alt?: string
  storageKey: string
  meta?: any
  url?: string
  createdAt: string
}

// Category Types
export interface Category {
  id: number
  name: string
  slug: string
  parentId?: number
  order: number
  isActive: boolean
  children?: Category[]
}

// Tag Types
export interface Tag {
  id: number
  name: string
  slug: string
}

// User Types
export interface User {
  id: number
  email: string
  displayName: string
  role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'VIEWER'
  createdAt: string
}

// SEO Types
export interface SEOMeta {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  ogTitle?: string
  ogDescription?: string
  canonical?: string
  noindex?: boolean
  nofollow?: boolean
}

// Form Types
export interface FormSubmission {
  formCode: string
  payload: Record<string, any>
}
