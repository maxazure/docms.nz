<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div class="text-2xl font-bold" style="color: var(--primary-color)">
            {{ site?.name || 'Docms' }}
          </div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <template v-for="item in visibleMenuItems" :key="item.id">
            <NuxtLink
              :to="getMenuLink(item)"
              :class="[
                'text-base font-medium transition-colors py-2 relative',
                isActiveLink(item)
                  ? 'text-primary-600 font-semibold'
                  : 'text-gray-700 hover:text-primary-600'
              ]"
            >
              {{ item.label }}
              <!-- Active indicator -->
              <span
                v-if="isActiveLink(item)"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
              ></span>
            </NuxtLink>
          </template>
        </nav>

        <!-- Mobile Menu Button -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          :aria-label="mobileMenuOpen ? '关闭菜单' : '打开菜单'"
        >
          <svg
            v-if="!mobileMenuOpen"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg
            v-else
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t">
          <nav class="flex flex-col space-y-2">
            <template v-for="item in visibleMenuItems" :key="item.id">
              <NuxtLink
                :to="getMenuLink(item)"
                :class="[
                  'px-4 py-3 rounded-md text-base font-medium transition-colors',
                  isActiveLink(item)
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
                @click="mobileMenuOpen = false"
              >
                {{ item.label }}
              </NuxtLink>
            </template>
          </nav>
        </div>
      </transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { MenuItem } from '~/types'

const { site, menu } = useSiteData()
const route = useRoute()
const mobileMenuOpen = ref(false)

const visibleMenuItems = computed(() => {
  return menu.value.filter(item => item.isVisible && item.isActive)
})

const getMenuLink = (item: MenuItem): string => {
  if (item.linkType === 'external' && item.linkTarget) {
    return item.linkTarget
  }

  switch (item.type) {
    case 'PAGE':
      // 特殊处理首页：slug为'home'或'index'时返回'/'
      if (item.slug === 'home' || item.slug === 'index' || item.slug === '') {
        return '/'
      }
      return `/${item.slug}`
    case 'POST_LIST':
      return `/posts?menuId=${item.id}`
    case 'PRODUCT':
      return `/products?menuId=${item.id}`
    default:
      // 对于其他类型，也特殊处理首页
      if (item.slug === 'home' || item.slug === 'index' || item.slug === '') {
        return '/'
      }
      return `/${item.slug}`
  }
}

const isActiveLink = (item: MenuItem): boolean => {
  const currentPath = route.path
  const menuLink = getMenuLink(item)

  // Handle home page
  if (item.slug === 'home' && currentPath === '/') {
    return true
  }

  // Handle exact match
  if (currentPath === menuLink) {
    return true
  }

  // Handle product and post list pages with query params
  if (item.type === 'PRODUCT' && currentPath === '/products') {
    return route.query.menuId === item.id || !route.query.menuId
  }

  if (item.type === 'POST_LIST' && currentPath === '/posts') {
    return route.query.menuId === item.id || !route.query.menuId
  }

  // Handle nested pages
  if (item.slug !== 'home' && currentPath.startsWith(`/${item.slug}`)) {
    return true
  }

  return false
}
</script>

<style scoped>
.text-primary-600 {
  color: var(--primary-color, #10B981);
}

.bg-primary-50 {
  background-color: rgba(16, 185, 129, 0.1);
}

.text-primary-700 {
  color: var(--primary-color, #059669);
}

.bg-primary-600 {
  background-color: var(--primary-color, #10B981);
}

/* Smooth scrolling for sticky header */
header {
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.95);
}
</style>
