<template>
  <div id="app" :style="themeVars">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { themeVars, fetchSite, fetchMenu } = useSiteData()

// Fetch site data during app initialization (SSR-compatible)
await Promise.all([
  fetchSite(),
  fetchMenu('main')
])
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family, system-ui, sans-serif);
  font-size: var(--font-size, 16px);
  line-height: 1.6;
  color: #333;
}

a {
  color: var(--primary-color, #10B981);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
