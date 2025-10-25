<template>
  <div class="post-editor">
    <!-- Header -->
    <div class="editor-header">
      <n-space justify="space-between" align="center">
        <n-space align="center">
          <n-button text @click="handleBack">
            <template #icon>
              <n-icon><ArrowBackOutline /></n-icon>
            </template>
          </n-button>
          <h2>{{ isNew ? '新建文章' : '编辑文章' }}</h2>
          <n-tag v-if="!isNew && postData" :type="postData.status === 'published' ? 'success' : 'default'">
            {{ postData.status === 'published' ? '已发布' : '草稿' }}
          </n-tag>
        </n-space>

        <n-space>
          <n-button @click="handleSave" :loading="saving" data-test="save-draft-button">
            <template #icon>
              <n-icon><SaveOutline /></n-icon>
            </template>
            保存草稿
          </n-button>
          <n-button type="primary" @click="handlePublish" :loading="saving" data-test="publish-button">
            <template #icon>
              <n-icon><CloudUploadOutline /></n-icon>
            </template>
            {{ isNew ? '发布文章' : '保存并发布' }}
          </n-button>
        </n-space>
      </n-space>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <n-spin size="large" />
    </div>

    <!-- Error -->
    <n-alert v-else-if="error" type="error" title="加载失败" style="margin: 16px 0">
      {{ error }}
    </n-alert>

    <!-- Editor Content -->
    <div v-else class="editor-content">
      <n-tabs v-model:value="activeTab" type="line">
        <!-- 基本信息与内容 -->
        <n-tab-pane name="basic" tab="文章编辑">
          <n-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-placement="top"
            size="medium"
          >
            <n-grid :cols="2" :x-gap="16">
              <n-gi>
                <n-form-item label="文章标题" path="title">
                  <n-input
                    v-model:value="formData.title"
                    placeholder="请输入文章标题"
                    data-test="title-input"
                    @input="generateSeoFromTitle"
                  />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="URL Slug" path="slug">
                  <n-input
                    v-model:value="formData.slug"
                    placeholder="例如: my-first-post"
                    data-test="slug-input"
                  />
                </n-form-item>
              </n-gi>
            </n-grid>

            <n-form-item label="文章摘要" path="summary">
              <n-input
                v-model:value="formData.summary"
                type="textarea"
                :rows="3"
                placeholder="请输入文章摘要，用于文章列表和SEO描述"
              />
            </n-form-item>

            <n-form-item label="所属栏目" path="menuItemId">
              <n-select
                v-model:value="formData.menuItemId"
                :options="menuItemOptions"
                placeholder="选择所属栏目"
              />
            </n-form-item>

            <n-form-item label="分类" path="categoryIds">
              <n-select
                v-model:value="formData.categoryIds"
                :options="categoryOptions"
                multiple
                placeholder="选择文章分类"
                data-test="category-select"
                clearable
              />
            </n-form-item>

            <n-form-item label="标签" path="tagIds">
              <n-select
                v-model:value="formData.tagIds"
                :options="tagOptions"
                multiple
                placeholder="选择文章标签"
                clearable
              />
            </n-form-item>

            <n-form-item label="封面图片">
              <div class="cover-image-section">
                <div v-if="formData.coverImageId" class="cover-preview">
                  <img :src="formData.coverImageId" alt="封面图片" data-test="cover-image-preview" />
                  <div class="cover-actions">
                    <n-button size="small" @click="handleChooseCoverImage">更换图片</n-button>
                    <n-button size="small" type="error" @click="handleRemoveCoverImage">删除</n-button>
                  </div>
                </div>
                <div v-else class="cover-upload">
                  <n-upload
                    :max="1"
                    :file-list="[]"
                    accept="image/*"
                    @before-upload="handleCoverUpload"
                  >
                    <n-upload-dragger>
                      <div style="margin-bottom: 12px">
                        <n-icon size="48" depth="3">
                          <CloudUploadOutline />
                        </n-icon>
                      </div>
                      <n-text style="font-size: 16px">点击或拖拽文件到此处上传封面图片</n-text>
                    </n-upload-dragger>
                  </n-upload>
                </div>
              </div>
            </n-form-item>

            <n-form-item label="文章内容">
              <div class="content-editor">
                <div ref="editorContainer" class="quill-editor"></div>
              </div>
            </n-form-item>
          </n-form>
        </n-tab-pane>

        <!-- SEO设置 -->
        <n-tab-pane name="seo" tab="SEO设置" data-test="seo-tab">
          <n-form label-placement="top" size="medium">
            <n-form-item label="SEO标题">
              <n-input
                v-model:value="formData.meta!.seoTitle"
                placeholder="搜索引擎显示的标题（留空则使用文章标题）"
                maxlength="60"
                show-count
                data-test="seo-title"
              />
            </n-form-item>

            <n-form-item label="SEO描述">
              <n-input
                v-model:value="formData.meta!.seoDescription"
                type="textarea"
                :rows="3"
                placeholder="搜索引擎显示的描述（留空则使用文章摘要）"
                maxlength="160"
                show-count
                data-test="seo-description"
              />
            </n-form-item>

            <n-form-item label="SEO关键词">
              <n-dynamic-tags
                v-model:value="formData.meta!.seoKeywords"
                placeholder="输入关键词后按回车添加"
                data-test="seo-keywords"
              />
            </n-form-item>
          </n-form>
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- Media Selector Modal -->
    <n-modal
      v-model:show="showMediaSelector"
      preset="card"
      title="选择封面图片"
      style="width: 800px"
      data-test="media-selector"
    >
      <media-selector
        :multiple="false"
        :accept-types="['image/jpeg', 'image/png', 'image/gif', 'image/webp']"
        @select="handleMediaSelected"
      />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessage, useDialog } from 'naive-ui'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import {
  ArrowBackOutline,
  SaveOutline,
  CloudUploadOutline
} from '@vicons/ionicons5'
import type { Post, Category, Tag, CreatePostDto, UpdatePostDto } from '@/types/post'
import {
  getPost,
  createPost,
  updatePost,
  publishPost,
  getCategoryList,
  getTagList
} from '@/api/post'
import { uploadMedia } from '@/api/media'
import { useMenuStore } from '@/stores/menu'
import MediaSelector from '@/components/media/MediaSelector.vue'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const dialog = useDialog()
const menuStore = useMenuStore()

// 基础状态
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const activeTab = ref('basic')
const showMediaSelector = ref(false)

// 表单数据
const formRef = ref()
const editorContainer = ref<HTMLElement>()
let quillEditor: Quill | null = null

const defaultFormData: CreatePostDto = {
  menuItemId: '',
  title: '',
  slug: '',
  summary: '',
  content: '',
  coverImageId: '',
  categoryIds: [],
  tagIds: [],
  meta: {
    seoTitle: '',
    seoDescription: '',
    seoKeywords: []
  }
}

const formData = ref<CreatePostDto>({ ...defaultFormData })
const postData = ref<Post>()

// 选项数据
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

// 计算属性
const isNew = computed(() => !route.params.id || route.params.id === 'new')
const postId = computed(() => route.params.id as string)

const menuItemOptions = computed(() => {
  return menuStore.mainMenuTree
    .filter(item => item.type.toUpperCase() === 'POST_LIST')
    .map(item => ({
      label: item.label,
      value: item.id
    }))
})

const categoryOptions = computed(() => {
  return categories.value.map(cat => ({
    label: cat.name,
    value: cat.id
  }))
})

const tagOptions = computed(() => {
  return tags.value.map(tag => ({
    label: tag.name,
    value: tag.id
  }))
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' }
  ],
  slug: [
    { required: true, message: '请输入URL Slug', trigger: 'blur' },
    { pattern: /^[a-z0-9-]+$/, message: '只能包含小写字母、数字和连字符', trigger: 'blur' }
  ],
  menuItemId: [
    { required: true, message: '请选择所属栏目', trigger: 'change' }
  ]
}

// 初始化富文本编辑器
function initEditor() {
  if (!editorContainer.value) return

  const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ header: 1 }, { header: 2 }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }],
    [{ size: ['small', false, 'large', 'huge'] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ['link', 'image'],
    ['clean']
  ]

  quillEditor = new Quill(editorContainer.value, {
    theme: 'snow',
    modules: {
      toolbar: toolbarOptions
    },
    placeholder: '开始编写文章内容...'
  })

  // 监听内容变化
  quillEditor.on('text-change', () => {
    if (quillEditor) {
      formData.value.content = quillEditor.root.innerHTML
    }
  })

  // 设置初始内容
  if (formData.value.content) {
    quillEditor.root.innerHTML = formData.value.content
  }
}

// 生成SEO信息
function generateSeoFromTitle() {
  if (!formData.value.meta?.seoTitle) {
    formData.value.meta!.seoTitle = formData.value.title
  }
}

// 加载文章数据
async function loadPost() {
  if (!postId.value || isNew.value) return

  try {
    loading.value = true
    const post = await getPost(postId.value) as any
    postData.value = post

    // 转换 content 格式：如果是对象则提取 data 字段
    let contentHtml = ''
    if (typeof post.content === 'object' && post.content?.data) {
      contentHtml = post.content.data
    } else if (typeof post.content === 'string') {
      contentHtml = post.content
    }

    // 从 postCategories 和 postTags 提取 ID 数组
    const categoryIds = post.postCategories?.map((pc: any) => pc.categoryId) || []
    const tagIds = post.postTags?.map((pt: any) => pt.tagId) || []

    // 填充表单数据
    formData.value = {
      menuItemId: post.menuItemId,
      title: post.title,
      slug: post.slug,
      summary: post.summary || '',
      content: contentHtml,
      coverImageId: post.coverImageId || '',
      categoryIds: categoryIds,
      tagIds: tagIds,
      meta: {
        seoTitle: post.meta?.seoTitle || '',
        seoDescription: post.meta?.seoDescription || '',
        seoKeywords: post.meta?.seoKeywords || []
      }
    }

    // 更新富文本编辑器内容
    await nextTick()
    if (quillEditor && contentHtml) {
      quillEditor.root.innerHTML = contentHtml
    }
  } catch (err: any) {
    error.value = '加载文章失败：' + err.message
    message.error('加载文章失败')
  } finally {
    loading.value = false
  }
}

// 加载分类和标签
async function loadCategoriesAndTags() {
  try {
    categories.value = await getCategoryList()
    tags.value = await getTagList()
  } catch (err: any) {
    console.error('加载分类标签失败:', err)
  }
}

// 保存草稿
async function handleSave() {
  try {
    await formRef.value?.validate()
    saving.value = true

    if (isNew.value) {
      const newPost = await createPost(formData.value)
      message.success('保存成功')
      router.replace(`/posts/edit/${newPost.id}`)
    } else {
      await updatePost(postId.value, formData.value)
      message.success('保存成功')
    }
  } catch (err: any) {
    if (err.message?.includes('validation')) {
      message.error('请检查表单填写是否正确')
    } else {
      message.error('保存失败：' + (err.message || '未知错误'))
    }
  } finally {
    saving.value = false
  }
}

// 发布文章
async function handlePublish() {
  try {
    await formRef.value?.validate()
    saving.value = true

    let post: Post
    if (isNew.value) {
      post = await createPost(formData.value)
    } else {
      post = await updatePost(postId.value, formData.value)
    }

    await publishPost(post.id)
    message.success('发布成功')

    if (isNew.value) {
      router.replace(`/posts/edit/${post.id}`)
    }
  } catch (err: any) {
    message.error('发布失败：' + (err.message || '未知错误'))
  } finally {
    saving.value = false
  }
}

// 选择封面图片
function handleChooseCoverImage() {
  showMediaSelector.value = true
}

// 删除封面图片
function handleRemoveCoverImage() {
  formData.value.coverImageId = ''
}

// 媒体选择回调
function handleMediaSelected(media: any[]) {
  if (media.length > 0) {
    formData.value.coverImageId = media[0].id
  }
  showMediaSelector.value = false
}

// 上传封面图片
async function handleCoverUpload({ file }: any) {
  try {
    const formData = new FormData()
    formData.append('file', file.file)

    const result = await uploadMedia(formData)
    formData.value.coverImageId = result.data?.id
    message.success('上传成功')
    return false // 阻止默认上传行为
  } catch (err: any) {
    message.error('上传失败：' + err.message)
    return false
  }
}

// 返回列表
function handleBack() {
  router.push('/posts')
}

// 生命周期
onMounted(async () => {
  // 初始化菜单数据
  await menuStore.init()

  // 加载分类和标签
  await loadCategoriesAndTags()

  // 加载文章数据
  if (!isNew.value) {
    await loadPost()
  }

  // 确保DOM已更新，loading状态已经变为false
  await nextTick()
  await nextTick() // 双重nextTick确保v-else内容已渲染

  // 初始化富文本编辑器
  initEditor()
})

// 监听路由变化
watch(
  () => route.params.id,
  async (newId) => {
    if (newId && newId !== 'new') {
      await loadPost()
    }
  }
)
</script>

<style scoped>
.post-editor {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.editor-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--n-border-color);
}

.editor-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.editor-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.cover-image-section {
  width: 100%;
}

.cover-preview {
  position: relative;
  width: 300px;
  height: 200px;
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
  overflow: hidden;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.cover-preview:hover .cover-actions {
  opacity: 1;
}

.cover-upload {
  width: 100%;
  max-width: 400px;
}

.content-editor {
  min-height: 500px;
}

.quill-editor {
  height: 500px;
}

:deep(.ql-toolbar) {
  border-radius: 8px 8px 0 0;
  border-color: var(--n-border-color);
  background: var(--n-color);
}

:deep(.ql-container) {
  border-radius: 0 0 8px 8px;
  border-color: var(--n-border-color);
  font-size: 16px;
  line-height: 1.6;
}

:deep(.ql-editor) {
  min-height: 450px;
  padding: 20px;
}
</style>
