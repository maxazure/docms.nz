<script setup lang="ts">
import type { ContentResponse } from '~/types';

const props = defineProps<{
  content: ContentResponse;
}>();

// 动态解析区块组件
const resolveBlockComponent = (type: string) => {
  // 将 'hero' -> 'BlockHero', 'text' -> 'BlockText'
  const componentName = `Block${type.charAt(0).toUpperCase() + type.slice(1)}`;
  try {
    return resolveComponent(componentName);
  } catch (error) {
    console.error(`Block component ${componentName} not found for type: ${type}`);
    return null;
  }
};
</script>

<template>
  <div class="page-renderer">
    <!-- 页面标题（可选，取决于设计） -->
    <div v-if="content.data.title" class="page-header container">
      <h1>{{ content.data.title }}</h1>
    </div>

    <!-- 区块渲染 -->
    <div class="page-blocks">
      <template v-for="block in content.data.blocks" :key="block.id">
        <component
          :is="resolveBlockComponent(block.type)"
          v-if="block.visibility && resolveBlockComponent(block.type)"
          v-bind="block.props"
          :block-id="block.id"
        />
        <div v-else-if="block.visibility" class="block-error">
          <p>区块类型 "{{ block.type }}" 未找到</p>
        </div>
      </template>
    </div>

    <!-- 如果没有区块 -->
    <div v-if="!content.data.blocks || content.data.blocks.length === 0" class="no-content container">
      <p>此页面暂无内容</p>
    </div>
  </div>
</template>

<style scoped>
.page-renderer {
  width: 100%;
}

.page-header {
  padding: 3rem 0;
  text-align: center;
}

.page-header h1 {
  font-size: 3rem;
  margin: 0;
}

.page-blocks {
  width: 100%;
}

.block-error {
  padding: 2rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  text-align: center;
}

.no-content {
  padding: 4rem 0;
  text-align: center;
  color: var(--text-light);
}
</style>
