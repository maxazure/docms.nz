/**
 * Product API
 * 产品管理API
 */

import { http } from '@/utils/request'
import type {
  Product,
  ProductListQuery,
  CreateProductDto,
  UpdateProductDto,
  ProductCategory
} from '@/types/product'
import type { ListResponse } from '@/types'

export function getProductList(params?: ProductListQuery): Promise<ListResponse<Product>> {
  return http.get('/products', { params })
}

export function getProduct(id: string): Promise<Product> {
  return http.get(`/api/products/${id}`)
}

export function createProduct(data: CreateProductDto): Promise<Product> {
  return http.post('/products', data)
}

export function updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
  return http.put(`/api/products/${id}`, data)
}

export function deleteProduct(id: string): Promise<void> {
  return http.delete(`/api/products/${id}`)
}

export function toggleActive(id: string): Promise<Product> {
  return http.post(`/api/products/${id}/toggle-active`)
}

export function toggleFeatured(id: string): Promise<Product> {
  return http.post(`/api/products/${id}/toggle-featured`)
}

export function getProductCategories(): Promise<ProductCategory[]> {
  return http.get('/products/categories')
}
