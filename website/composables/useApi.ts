import type {
  Site,
  MenuItem,
  Page,
  Post,
  Product,
  Category,
  Tag,
  Media,
  PaginatedResponse,
  FormSubmission
} from '~/types'

export const useApi = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string

  // Generic fetch wrapper
  const apiFetch = async <T>(endpoint: string, options?: any): Promise<T> => {
    // Ensure endpoint doesn't start with /api since apiBase doesn't include it
    const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.substring(4) : endpoint
    try {
      const response = await $fetch<any>(`${apiBase}${cleanEndpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      // Handle API response wrapper: {success: true, data: ...}
      if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        return response.data as T
      }

      return response as T
    } catch (error: any) {
      console.error(`API Error [${cleanEndpoint}]:`, error)
      throw error
    }
  }

  return {
    // Site API
    site: {
      get: () => apiFetch<Site>('/site'),
    },

    // Menu API
    menu: {
      getAll: (menuCode?: string) =>
        apiFetch<MenuItem[]>(`/menu${menuCode ? `?menuCode=${menuCode}` : ''}`),
      getById: (id: string) => apiFetch<MenuItem>(`/menu/${id}`),
    },

    // Page API
    pages: {
      getAll: (query?: any) => apiFetch<PaginatedResponse<Page>>('/pages', { query }),
      getBySlug: (slug: string) => apiFetch<Page>(`/pages/by-slug/${slug}`),
      getById: (id: number) => apiFetch<Page>(`/pages/${id}`),
    },

    // Post API
    posts: {
      getAll: (query?: any) => apiFetch<PaginatedResponse<Post>>('/posts', { query }),
      getBySlug: (slug: string) => apiFetch<Post>(`/posts/by-slug/${slug}`),
      getById: (id: number) => apiFetch<Post>(`/posts/${id}`),
    },

    // Product API
    products: {
      getAll: (query?: any) => apiFetch<PaginatedResponse<Product>>('/products', { query }),
      getBySlug: (slug: string) => apiFetch<Product>(`/products/by-slug/${slug}`),
      getById: (id: number) => apiFetch<Product>(`/products/${id}`),
    },

    // Category API
    categories: {
      getAll: () => apiFetch<Category[]>('/categories'),
      getById: (id: number) => apiFetch<Category>(`/categories/${id}`),
    },

    // Tag API
    tags: {
      getAll: () => apiFetch<Tag[]>('/tags'),
      getById: (id: number) => apiFetch<Tag>(`/tags/${id}`),
    },

    // Media API
    media: {
      getUrl: (storageKey: string) => `${apiBase}/uploads/${storageKey}`,
    },

    // Search API
    search: {
      query: (q: string, page = 1, limit = 10) =>
        apiFetch<PaginatedResponse<Post | Product | Page>>('/search', {
          query: { q, page, limit },
        }),
    },

    // Form API
    forms: {
      submit: (data: FormSubmission) =>
        apiFetch('/form-submissions', {
          method: 'POST',
          body: data,
        }),
    },
  }
}
