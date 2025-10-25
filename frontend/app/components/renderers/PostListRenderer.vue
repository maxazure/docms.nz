<script setup lang="ts">
import type { ContentResponse, Post } from '~/types';

const props = defineProps<{
  content: ContentResponse;
}>();

const api = useApi();
const posts = computed(() => props.content.data as Post[]);

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// 获取封面图片URL
const getCoverImage = (post: Post) => {
  if (!post.coverImageId) return '/placeholder.jpg';
  return api.getMediaUrl(post.coverImageId);
};
</script>

<template>
  <div class="post-list-renderer">
    <div class="container">
      <h1 class="page-title">{{ content.menuItem?.label || '文章列表' }}</h1>

      <div class="posts-grid">
        <article v-for="post in posts" :key="post.id" class="post-card">
          <NuxtLink :to="`/posts/${post.slug}`" class="post-link">
            <div class="post-image">
              <img :src="getCoverImage(post)" :alt="post.title" />
            </div>
            <div class="post-content">
              <h2 class="post-title">{{ post.title }}</h2>
              <p v-if="post.summary" class="post-summary">{{ post.summary }}</p>
              <div class="post-meta">
                <span v-if="post.author" class="post-author">
                  {{ post.author.displayName }}
                </span>
                <span class="post-date">{{ formatDate(post.publishedAt || post.createdAt) }}</span>
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>

      <div v-if="!posts || posts.length === 0" class="no-posts">
        <p>暂无文章</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-list-renderer {
  padding: 4rem 0;
}

.page-title {
  text-align: center;
  font-size: 3rem;
  margin-bottom: 3rem;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.post-card {
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.post-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.post-image {
  width: 100%;
  padding-bottom: 60%;
  position: relative;
  overflow: hidden;
  background: #f3f4f6;
}

.post-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  padding: 1.5rem;
}

.post-title {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--text-color);
}

.post-summary {
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-light);
}

.no-posts {
  text-align: center;
  padding: 4rem 0;
  color: var(--text-light);
}
</style>
