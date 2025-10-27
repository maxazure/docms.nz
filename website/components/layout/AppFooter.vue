<template>
  <footer class="bg-gray-900 text-white mt-auto">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Company Info -->
        <div>
          <h3 class="text-lg font-bold mb-4">{{ site?.name }}</h3>
          <p class="text-gray-400 text-sm leading-relaxed">
            {{ site?.settings?.description || '专业企业CMS解决方案' }}
          </p>
          <div v-if="site?.settings?.keywords" class="mt-4">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="keyword in site.settings.keywords.slice(0, 3)"
                :key="keyword"
                class="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded"
              >
                {{ keyword }}
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-lg font-bold mb-4">快速链接</h3>
          <ul class="space-y-3">
            <li v-for="item in footerLinks" :key="item.id">
              <NuxtLink
                :to="getMenuLink(item)"
                class="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center group"
              >
                <svg class="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h3 class="text-lg font-bold mb-4">联系我们</h3>
          <ul class="space-y-3 text-sm text-gray-400">
            <li class="flex items-start">
              <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href="mailto:info@example.com" class="hover:text-white transition-colors">
                info@example.com
              </a>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>400-XXX-XXXX</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>中国·上海</span>
            </li>
          </ul>
        </div>

        <!-- Social Media & Follow -->
        <div>
          <h3 class="text-lg font-bold mb-4">关注我们</h3>
          <div class="space-y-4">
            <div class="flex flex-col space-y-3">
              <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
                微博
              </a>
              <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
                微信公众号
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div class="border-t border-gray-800 mt-10 pt-8">
        <div class="text-center text-sm text-gray-400 space-y-2">
          <p>© {{ currentYear }} {{ site?.name || 'Docms' }}. All rights reserved.</p>
          <div class="flex items-center justify-center space-x-4 text-xs">
            <NuxtLink to="/privacy" class="hover:text-white transition-colors">隐私政策</NuxtLink>
            <span>·</span>
            <NuxtLink to="/terms" class="hover:text-white transition-colors">服务条款</NuxtLink>
            <span>·</span>
            <a href="#" class="hover:text-white transition-colors">网站地图</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import type { MenuItem } from '~/types'

const { site, menu } = useSiteData()
const currentYear = new Date().getFullYear()

const footerLinks = computed(() => {
  return menu.value.filter(item => item.isVisible && item.isActive).slice(0, 5)
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
      return `/posts`
    case 'PRODUCT':
      return `/products`
    default:
      // 对于其他类型，也特殊处理首页
      if (item.slug === 'home' || item.slug === 'index' || item.slug === '') {
        return '/'
      }
      return `/${item.slug}`
  }
}
</script>
