/**
 * API 数据获取 Composable
 * 提供与后端 API 交互的所有方法
 */
export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase;

  return {
    /**
     * 获取站点信息（名称、Logo、主题配置等）
     */
    async getSiteInfo() {
      try {
        const response: any = await $fetch('/site', { baseURL });
        return response?.data || response;
      } catch (error) {
        console.error('Failed to fetch site info:', error);
        return null;
      }
    },

    /**
     * 根据 menuCode 获取菜单项
     * @param menuCode 菜单代码，如 'main' | 'footer'
     */
    async getMenuItems(menuCode: string) {
      try {
        const response: any = await $fetch(`/menu`, {
          baseURL,
          params: { menuCode, visibleOnly: true },
        });
        const items = response?.data || response || [];
        // 过滤指定 menuCode 的项
        return items.filter((item: any) => item.menuCode === menuCode);
      } catch (error) {
        console.error(`Failed to fetch menu items for ${menuCode}:`, error);
        return [];
      }
    },

    /**
     * 根据 slug 获取内容（页面/文章/产品等）
     * @param slug URL slug，如 'about-us' 或 'products/water-system'
     */
    async getContentBySlug(slug: string) {
      try {
        // 首先尝试从菜单项中查找
        const response: any = await $fetch('/menu', {
          baseURL,
          params: { visibleOnly: true },
        });
        const menuItems = response?.data || response || [];
        
        const menuItem = menuItems.find((item: any) => item.slug === slug);
        
        if (!menuItem) {
          return null;
        }

        // 根据菜单项类型获取相应的内容
        switch (menuItem.type) {
          case 'PAGE':
            // 获取所有已发布的页面，然后通过 slug 匹配
            const pagesResponse: any = await $fetch('/pages', {
              baseURL,
              params: { 
                status: 'PUBLISHED',
              },
            });
            const pages = pagesResponse?.data || [];
            // 从结果中找到完全匹配 slug 的页面
            const page = pages.find((p: any) => p.slug === menuItem.slug);
            if (page) {
              return {
                type: 'PAGE',
                menuItem,
                data: page,
              };
            }
            break;

          case 'POST_LIST':
            const postsResponse: any = await $fetch('/posts', {
              baseURL,
              params: { status: 'PUBLISHED' },
            });
            const posts = postsResponse?.data || postsResponse || [];
            return {
              type: 'POST_LIST',
              menuItem,
              data: posts,
            };

          case 'PRODUCT':
            const productsResponse: any = await $fetch('/products', {
              baseURL,
              params: { isActive: true },
            });
            const products = productsResponse?.data || productsResponse || [];
            return {
              type: 'PRODUCT_LIST',
              menuItem,
              data: products,
            };
        }

        return null;
      } catch (error) {
        console.error(`Failed to fetch content for slug ${slug}:`, error);
        return null;
      }
    },

    /**
     * 根据 slug 获取文章详情
     * @param slug 文章 slug
     */
    async getPostBySlug(slug: string) {
      try {
        const response: any = await $fetch(`/posts/slug/${slug}`, { baseURL });
        return response?.data || response;
      } catch (error) {
        console.error(`Failed to fetch post ${slug}:`, error);
        return null;
      }
    },

    /**
     * 根据 slug 获取产品详情
     * @param slug 产品 slug
     */
    async getProductBySlug(slug: string) {
      try {
        const response: any = await $fetch(`/products/slug/${slug}`, { baseURL });
        return response?.data || response;
      } catch (error) {
        console.error(`Failed to fetch product ${slug}:`, error);
        return null;
      }
    },

    /**
     * 获取所有已发布的文章
     */
    async getPosts(params?: { categoryId?: string; tagId?: string; limit?: number }) {
      try {
        const response: any = await $fetch('/posts', {
          baseURL,
          params: { status: 'PUBLISHED', ...params },
        });
        return response?.data || response || [];
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        return [];
      }
    },

    /**
     * 获取所有激活的产品
     */
    async getProducts(params?: { categoryId?: string; isFeatured?: boolean; limit?: number }) {
      try {
        const response: any = await $fetch('/products', {
          baseURL,
          params: { isActive: true, ...params },
        });
        return response?.data || response || [];
      } catch (error) {
        console.error('Failed to fetch products:', error);
        return [];
      }
    },

    /**
     * 获取所有分类
     */
    async getCategories() {
      try {
        const response: any = await $fetch('/categories', {
          baseURL,
          params: { isActive: true },
        });
        return response?.data || response || [];
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        return [];
      }
    },

    /**
     * 提交表单
     * @param formCode 表单代码，如 'contact'
     * @param payload 表单数据
     */
    async submitForm(formCode: string, payload: any) {
      try {
        return await $fetch('/form-submissions', {
          baseURL,
          method: 'POST',
          body: { formCode, payload },
        });
      } catch (error) {
        console.error('Failed to submit form:', error);
        throw error;
      }
    },

    /**
     * 获取媒体文件 URL
     * @param storageKey 存储键值
     */
    getMediaUrl(storageKey: string) {
      if (!storageKey) return '';
      // 如果是完整 URL，直接返回
      if (storageKey.startsWith('http')) return storageKey;
      // 否则构建 API 媒体 URL
      return `${baseURL}/uploads/${storageKey}`;
    },
  };
};
