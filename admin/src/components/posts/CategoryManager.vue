<template>
  <div class="category-manager">
    <n-space vertical :size="16">
      <n-space>
        <n-input
          v-model:value="newCategoryName"
          placeholder="分类名称"
          style="width: 200px"
          @keyup.enter="handleAdd"
        />
        <n-button type="primary" @click="handleAdd">添加分类</n-button>
      </n-space>

      <n-list bordered>
        <n-list-item v-for="category in categories" :key="category.id">
          <n-space justify="space-between" style="width: 100%">
            <span>{{ category.name }}</span>
            <n-button size="small" type="error" @click="handleDelete(category)">
              删除
            </n-button>
          </n-space>
        </n-list-item>
        <n-empty v-if="categories.length === 0" description="暂无分类" />
      </n-list>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import type { Category } from '@/types/post'
import { getCategoryList, createCategory, deleteCategory } from '@/api/post'

const emit = defineEmits<{
  (e: 'update'): void
}>()

const message = useMessage()
const categories = ref<Category[]>([])
const newCategoryName = ref('')

async function loadCategories() {
  try {
    categories.value = await getCategoryList()
  } catch (error) {
    message.error('加载分类失败')
  }
}

async function handleAdd() {
  if (!newCategoryName.value.trim()) {
    message.warning('请输入分类名称')
    return
  }

  try {
    await createCategory({
      name: newCategoryName.value,
      slug: newCategoryName.value.toLowerCase().replace(/\s+/g, '-'),
      order: categories.value.length
    })
    message.success('添加成功')
    newCategoryName.value = ''
    loadCategories()
    emit('update')
  } catch (error) {
    message.error('添加失败')
  }
}

async function handleDelete(category: Category) {
  try {
    await deleteCategory(category.id)
    message.success('删除成功')
    loadCategories()
    emit('update')
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(() => {
  loadCategories()
})
</script>
