<script setup lang="ts">
import type { ContentResponse, Product } from '~/types';

const props = defineProps<{
  content: ContentResponse;
}>();

const api = useApi();
const products = computed(() => props.content.data as Product[]);

// 格式化价格
const formatPrice = (price?: number) => {
  if (!price) return '价格面议';
  return `¥${price.toLocaleString('zh-CN')}`;
};

// 获取产品图片
const getProductImage = (product: Product) => {
  if (!product.gallery || product.gallery.length === 0) return '/placeholder.jpg';
  return api.getMediaUrl(product.gallery[0]);
};
</script>

<template>
  <div class="product-list-renderer">
    <div class="container">
      <h1 class="page-title">{{ content.menuItem?.label || '产品中心' }}</h1>

      <div class="products-grid">
        <article v-for="product in products" :key="product.id" class="product-card">
          <NuxtLink :to="`/products/${product.slug}`" class="product-link">
            <div class="product-image">
              <img :src="getProductImage(product)" :alt="product.name" />
              <span v-if="product.isFeatured" class="featured-badge">推荐</span>
            </div>
            <div class="product-content">
              <h2 class="product-name">{{ product.name }}</h2>
              <p v-if="product.summary" class="product-summary">{{ product.summary }}</p>
              <div class="product-footer">
                <span class="product-price">{{ formatPrice(product.price) }}</span>
                <span v-if="product.category" class="product-category">
                  {{ product.category.name }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>

      <div v-if="!products || products.length === 0" class="no-products">
        <p>暂无产品</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-list-renderer {
  padding: 4rem 0;
}

.page-title {
  text-align: center;
  font-size: 3rem;
  margin-bottom: 3rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.product-card {
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.product-image {
  width: 100%;
  padding-bottom: 75%;
  position: relative;
  overflow: hidden;
  background: #f3f4f6;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 600;
}

.product-content {
  padding: 1.5rem;
}

.product-name {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: var(--text-color);
}

.product-summary {
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
}

.product-category {
  font-size: 0.875rem;
  color: var(--text-light);
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: var(--border-radius);
}

.no-products {
  text-align: center;
  padding: 4rem 0;
  color: var(--text-light);
}
</style>
