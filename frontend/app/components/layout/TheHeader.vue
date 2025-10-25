<script setup lang="ts">
import type { MenuItem } from '~/types';

const props = defineProps<{
  navItems?: MenuItem[];
}>();

const api = useApi();
const route = useRoute();

// 获取站点信息（Logo等）
const { data: siteInfo } = await useAsyncData('site-header', () => api.getSiteInfo());

// 移动端菜单状态
const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

// 判断链接是否激活
const isActive = (item: MenuItem) => {
  const currentPath = route.path;
  const itemPath = `/${item.slug}`;
  return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
};

// 获取Logo URL
const logoUrl = computed(() => {
  if (!siteInfo.value?.settings?.logo) return '';
  return api.getMediaUrl(siteInfo.value.settings.logo);
});
</script>

<template>
  <header class="site-header">
    <div class="container">
      <div class="header-content">
        <!-- Logo -->
        <NuxtLink to="/" class="site-logo">
          <img
            v-if="logoUrl"
            :src="logoUrl"
            :alt="siteInfo?.name || '网站Logo'"
          />
          <span v-else class="site-name">{{ siteInfo?.name || 'CMS' }}</span>
        </NuxtLink>

        <!-- 桌面端导航 -->
        <nav class="desktop-nav">
          <NuxtLink
            v-for="item in navItems"
            :key="item.id"
            :to="`/${item.slug}`"
            class="nav-link"
            :class="{ active: isActive(item) }"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- 移动端菜单按钮 -->
        <button class="mobile-menu-button" @click="toggleMobileMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <!-- 移动端导航 -->
      <nav v-if="mobileMenuOpen" class="mobile-nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.id"
          :to="`/${item.slug}`"
          class="mobile-nav-link"
          :class="{ active: isActive(item) }"
          @click="mobileMenuOpen = false"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.site-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.site-logo img {
  height: 40px;
  width: auto;
}

.site-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
}

.desktop-nav {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.nav-link:hover,
.nav-link.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.mobile-menu-button {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
}

.mobile-menu-button span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--text-color);
  transition: all 0.3s;
}

.mobile-nav {
  display: none;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 0;
  border-top: 1px solid var(--border-color);
}

.mobile-nav-link {
  color: var(--text-color);
  text-decoration: none;
  padding: 0.75rem 0;
  font-weight: 500;
}

.mobile-nav-link.active {
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .mobile-menu-button {
    display: flex;
  }

  .mobile-nav {
    display: flex;
  }
}
</style>
