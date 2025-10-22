/**
 * Product Types
 * 产品管理相关类型定义
 */

export interface Product {
  id: string
  menuItemId: string
  name: string
  slug: string
  summary?: string
  description: string
  coverImageId?: string
  coverImageUrl?: string
  gallery?: string[]
  specs?: ProductSpec[]
  categoryId?: string
  tagIds?: string[]
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt?: string
}

export interface ProductSpec {
  key: string
  label: string
  value: string
  unit?: string
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  parentId?: string
  order: number
}

export interface ProductListQuery {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  isActive?: boolean
  isFeatured?: boolean
}

export interface CreateProductDto {
  menuItemId: string
  name: string
  slug: string
  summary?: string
  description: string
  coverImageId?: string
  gallery?: string[]
  specs?: ProductSpec[]
  categoryId?: string
  tagIds?: string[]
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}
