<script setup lang="ts">
const api = useApi();

// 获取主导航和页脚导航
const { data: mainNav } = await useAsyncData('mainNav', () => api.getMenuItems('main'));
const { data: footerNav } = await useAsyncData('footerNav', () => api.getMenuItems('footer'));
</script>

<template>
  <div class="default-layout">
    <TheHeader :nav-items="mainNav" />
    <main class="main-content">
      <slot />
    </main>
    <TheFooter :nav-items="footerNav" />
  </div>
</template>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}
</style>
