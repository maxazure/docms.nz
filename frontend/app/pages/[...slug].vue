<script setup lang="ts">
import type { ContentResponse } from '~/types';

const route = useRoute();
const api = useApi();

// 将 URL 路径转换为 slug
// 例如: [] -> 'home', ['about'] -> 'about', ['products', 'water-system'] -> 'products/water-system'
const slug = computed(() => {
  const params = route.params.slug;
  if (!params || (Array.isArray(params) && params.length === 0)) {
    return 'home';
  }
  return Array.isArray(params) ? params.join('/') : params;
});

// 根据 slug 从 API 获取页面内容
const { data: content, error } = await useAsyncData<ContentResponse | null>(
  `content-${slug.value}`,
  () => api.getContentBySlug(slug.value)
);

// 如果内容不存在，显示 404 错误页面
if (!content.value || error.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    fatal: true,
  });
}

// 根据内容类型动态解析对应的渲染组件
const rendererComponent = computed(() => {
  if (!content.value) return null;

  const componentMap: Record<string, string> = {
    PAGE: 'PageRenderer',
    POST_LIST: 'PostListRenderer',
    PRODUCT_LIST: 'ProductListRenderer',
    POST_DETAIL: 'PostDetailRenderer',
    PRODUCT_DETAIL: 'ProductDetailRenderer',
  };

  const componentName = componentMap[content.value.type];
  return componentName ? resolveComponent(componentName) : null;
});

// 设置页面的 SEO Meta 信息
if (content.value?.data?.meta) {
  const meta = content.value.data.meta;
  useHead({
    title: meta.title || content.value.data.title || content.value.menuItem?.label,
    meta: [
      { name: 'description', content: meta.description || '' },
      { name: 'keywords', content: meta.keywords || '' },
      // Open Graph
      { property: 'og:title', content: meta.ogTitle || meta.title || '' },
      { property: 'og:description', content: meta.ogDescription || meta.description || '' },
      { property: 'og:image', content: meta.ogImage || '' },
      { property: 'og:type', content: 'website' },
    ],
  });
}
</script>

<template>
  <div v-if="content && rendererComponent" class="page-content">
    <component :is="rendererComponent" :content="content" />
  </div>
  <div v-else class="page-error">
    <p>内容无法显示</p>
  </div>
</template>

<style scoped>
.page-content {
  min-height: 60vh;
}

.page-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: var(--text-light);
}
</style>
