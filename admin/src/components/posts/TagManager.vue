<template>
  <div class="tag-manager">
    <n-space vertical :size="16">
      <n-space>
        <n-input
          v-model:value="newTagName"
          placeholder="标签名称"
          style="width: 200px"
          @keyup.enter="handleAdd"
        />
        <n-button type="primary" @click="handleAdd">添加标签</n-button>
      </n-space>

      <n-space>
        <n-tag
          v-for="tag in tags"
          :key="tag.id"
          closable
          @close="handleDelete(tag)"
        >
          {{ tag.name }}
        </n-tag>
        <n-empty v-if="tags.length === 0" description="暂无标签" />
      </n-space>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import type { Tag } from '@/types/post'
import { getTagList, createTag, deleteTag } from '@/api/post'

const emit = defineEmits<{
  (e: 'update'): void
}>()

const message = useMessage()
const tags = ref<Tag[]>([])
const newTagName = ref('')

async function loadTags() {
  try {
    tags.value = await getTagList()
  } catch (error) {
    message.error('加载标签失败')
  }
}

async function handleAdd() {
  if (!newTagName.value.trim()) {
    message.warning('请输入标签名称')
    return
  }

  try {
    await createTag({
      name: newTagName.value,
      slug: newTagName.value.toLowerCase().replace(/\s+/g, '-')
    })
    message.success('添加成功')
    newTagName.value = ''
    loadTags()
    emit('update')
  } catch (error) {
    message.error('添加失败')
  }
}

async function handleDelete(tag: Tag) {
  try {
    await deleteTag(tag.id)
    message.success('删除成功')
    loadTags()
    emit('update')
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(() => {
  loadTags()
})
</script>
