<script setup lang="ts">
const api = useApi();

// 获取站点信息（包括主题配置）
const { data: siteInfo } = await useAsyncData('site', () => api.getSiteInfo());

// 将从API获取的主题变量应用到CSS变量
const themeStyles = computed(() => {
  const tokens = siteInfo.value?.themeTokens;
  if (!tokens) return {};

  const styles: Record<string, string> = {};

  if (tokens.colors) {
    if (tokens.colors.primary) styles['--primary-color'] = tokens.colors.primary;
    if (tokens.colors.secondary) styles['--secondary-color'] = tokens.colors.secondary;
    if (tokens.colors.text) styles['--text-color'] = tokens.colors.text;
    if (tokens.colors.textLight) styles['--text-light'] = tokens.colors.textLight;
    if (tokens.colors.background) styles['--background-color'] = tokens.colors.background;
    if (tokens.colors.border) styles['--border-color'] = tokens.colors.border;
  }

  if (tokens.fonts) {
    if (tokens.fonts.body) styles['--font-family'] = tokens.fonts.body;
    if (tokens.fonts.heading) styles['--heading-font'] = tokens.fonts.heading;
  }

  if (tokens.style) {
    if (tokens.style.borderRadius) styles['--border-radius'] = `${tokens.style.borderRadius}px`;
    if (tokens.style.spacing) styles['--spacing-unit'] = `${tokens.style.spacing}px`;
  }

  return styles;
});

// 设置全局站点 Meta
useHead({
  title: siteInfo.value?.name || 'CMS',
  htmlAttrs: {
    lang: siteInfo.value?.locale || 'zh-CN',
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { charset: 'utf-8' },
  ],
});
</script>

<template>
  <div id="app" :style="themeStyles">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
/* 全局样式已在 assets/css/main.css 中定义 */
</style>
