/**
 * 前台类型定义
 */

export interface Site {
  id: string;
  name: string;
  domain: string;
  locale: string;
  themeTokens?: ThemeTokens;
  settings?: SiteSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeTokens {
  colors?: {
    primary?: string;
    secondary?: string;
    text?: string;
    textLight?: string;
    background?: string;
    border?: string;
  };
  fonts?: {
    body?: string;
    heading?: string;
  };
  style?: {
    borderRadius?: number;
    spacing?: number;
  };
}

export interface SiteSettings {
  logo?: string;
  favicon?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

export interface MenuItem {
  id: string;
  menuCode: string;
  label: string;
  slug: string;
  type: 'PAGE' | 'POST_LIST' | 'PRODUCT';
  linkType: 'INTERNAL' | 'EXTERNAL' | 'CUSTOM';
  linkTarget?: string;
  parentId?: string;
  order: number;
  icon?: string;
  isVisible: boolean;
  isActive: boolean;
  children?: MenuItem[];
  page?: Page;
}

export interface Page {
  id: string;
  menuItemId: string;
  title: string;
  slug: string;
  blocks: Block[];
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
  meta?: PageMeta;
  createdAt: string;
  updatedAt: string;
}

export interface Block {
  id: string;
  type: string;
  props: Record<string, any>;
  order: number;
  visibility: boolean;
}

export interface PageMeta {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: any;
  coverImageId?: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
  authorId: string;
  author?: {
    displayName: string;
  };
  meta?: PageMeta;
  postCategories?: Array<{ category: Category }>;
  postTags?: Array<{ tag: Tag }>;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  summary?: string;
  description?: any;
  specs?: Record<string, string>;
  gallery?: string[];
  price?: number;
  categoryId?: string;
  category?: Category;
  tags?: string[];
  isActive: boolean;
  isFeatured: boolean;
  meta?: PageMeta;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  children?: Category[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface ContentResponse {
  type: 'PAGE' | 'POST_LIST' | 'PRODUCT_LIST' | 'POST_DETAIL' | 'PRODUCT_DETAIL';
  menuItem?: MenuItem;
  data: any;
}
