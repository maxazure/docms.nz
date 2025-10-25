# Docms 管理后台 - 下一步开发计划

**制定日期**: 2025-10-24
**当前完成度**: 65%
**预计剩余时间**: 15-20天（单人开发）

---

## 📋 开发优先级总览

```
🔴 第一阶段 (1-2天) → 🟡 第二阶段 (5-7天) → 🟢 第三阶段 (3-5天) → 🔵 第四阶段 (3-5天)
修复关键问题         完善内容管理          完善辅助功能         全局优化与测试
```

---

## 🔴 第一阶段：修复关键问题（P0）

**目标**: 解决阻塞性问题，确保现有功能可用
**时间**: 1-2天
**优先级**: 最高

### Task 1: 修复侧边栏导航点击问题 🔴

**问题描述**:
- 点击左侧导航菜单项（首页、产品中心等）时页面不跳转
- 用户必须手动输入 URL 才能访问

**文件位置**: `admin/src/components/layout/AppSidebar.vue`

**解决方案**:
```typescript
// AppSidebar.vue 中添加事件处理
<n-menu
  v-model:value="activeKey"
  :collapsed="appStore.sidebarCollapsed"
  :collapsed-width="64"
  :collapsed-icon-size="22"
  :options="menuOptions"
  @update:value="handleMenuSelect"  // 添加这一行
/>

// 在 script 中添加处理函数
const handleMenuSelect = (key: string) => {
  router.push(key)
}
```

**验收标准**:
- [ ] 点击任意菜单项可正常跳转
- [ ] 当前页面高亮显示正确
- [ ] 子菜单展开折叠正常

---

### Task 2: 实现审计日志模块 🔴

**重要性**: PRD 明确要求，系统设置的核心功能

**步骤 1: 创建路由**

文件: `admin/src/router/index.ts`

```typescript
{
  path: 'audit',
  name: 'AuditLog',
  component: () => import('@/views/audit/AuditLog.vue'),
  meta: { title: '审计日志' }
}
```

**步骤 2: 创建 API 接口**

文件: `admin/src/api/audit.ts`

```typescript
import request from '@/utils/request'

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  details: any
  ipAddress: string
  userAgent: string
  createdAt: string
}

export interface AuditLogQuery {
  page?: number
  pageSize?: number
  userId?: string
  action?: string
  resource?: string
  startDate?: string
  endDate?: string
}

// 获取审计日志列表
export const getAuditLogs = (params: AuditLogQuery) => {
  return request.get<{ data: AuditLog[]; total: number }>('/audit-logs', { params })
}

// 获取审计日志详情
export const getAuditLogDetail = (id: string) => {
  return request.get<AuditLog>(`/audit-logs/${id}`)
}

// 导出审计日志
export const exportAuditLogs = (params: AuditLogQuery) => {
  return request.get('/audit-logs/export', {
    params,
    responseType: 'blob'
  })
}
```

**步骤 3: 创建页面组件**

文件: `admin/src/views/audit/AuditLog.vue`

**功能需求**:
- [ ] 日志列表展示（用户、操作、资源、时间）
- [ ] 用户筛选（下拉选择）
- [ ] 操作类型筛选（下拉选择）
- [ ] 时间范围筛选（日期范围选择器）
- [ ] 资源类型筛选
- [ ] 搜索功能（模糊搜索）
- [ ] 分页功能
- [ ] 查看详情（点击行展开或弹窗）
- [ ] 导出功能（CSV/Excel）
- [ ] 刷新按钮
- [ ] 加载状态
- [ ] 错误处理

**UI 参考结构**:
```vue
<template>
  <div class="audit-log-page">
    <n-card title="审计日志">
      <!-- 筛选栏 -->
      <n-space vertical :size="16">
        <n-space>
          <n-select
            v-model:value="query.userId"
            placeholder="选择用户"
            :options="userOptions"
            clearable
            style="width: 200px"
          />
          <n-select
            v-model:value="query.action"
            placeholder="操作类型"
            :options="actionOptions"
            clearable
            style="width: 150px"
          />
          <n-date-picker
            v-model:value="dateRange"
            type="daterange"
            clearable
            style="width: 300px"
          />
          <n-button @click="handleSearch">搜索</n-button>
          <n-button @click="handleReset">重置</n-button>
          <n-button @click="handleExport">导出</n-button>
        </n-space>

        <!-- 数据表格 -->
        <n-data-table
          :columns="columns"
          :data="logs"
          :loading="loading"
          :pagination="pagination"
          @update:page="handlePageChange"
        />
      </n-space>
    </n-card>
  </div>
</template>
```

**步骤 4: 编写测试**

文件: `admin/tests/views/audit/AuditLog.spec.ts`

测试用例:
- [ ] 日志列表正常加载
- [ ] 用户筛选功能
- [ ] 操作类型筛选功能
- [ ] 时间范围筛选功能
- [ ] 搜索功能
- [ ] 分页功能
- [ ] 查看详情功能
- [ ] 导出功能
- [ ] 错误处理

**验收标准**:
- [ ] 页面可正常访问（不再 404）
- [ ] 所有筛选功能正常工作
- [ ] 分页正确显示
- [ ] 查看详情可以展示完整信息
- [ ] 导出功能正常

---

### Task 3: 修复文章数据显示问题 🟡

**问题 1: 文章状态显示为"草稿"**

文件: `api/prisma/seed.ts`

检查并修复:
```typescript
// 确保发布状态正确
await prisma.post.create({
  data: {
    title: '什么是水培?家庭水培完全入门指南',
    slug: 'what-is-hydroponics-beginner-guide',
    status: 'PUBLISHED',  // 确保是 PUBLISHED 而不是 DRAFT
    publishedAt: new Date('2025-01-15'),
    // ...
  }
})
```

**问题 2: 文章分类显示为"-"**

检查关联设置:
```typescript
await prisma.post.create({
  data: {
    // ...
    categories: {
      connect: [
        { id: beginnerCategory.id },
        { id: educationCategory.id }
      ]
    }
  }
})
```

**验收标准**:
- [ ] 重新运行 seed 后，已发布文章显示"已发布"状态
- [ ] 文章列表正确显示所属分类
- [ ] 发布时间正确显示

---

## 🟡 第二阶段：完善核心内容管理（P1）

**目标**: 实现文章和产品的完整编辑功能
**时间**: 5-7天
**优先级**: 高

### Task 4: 实现文章编辑器 🟡

**重要性**: 内容创作的核心功能

#### 步骤 1: 创建路由

文件: `admin/src/router/index.ts`

```typescript
{
  path: 'posts/create',
  name: 'PostCreate',
  component: () => import('@/views/posts/PostEditor.vue'),
  meta: { title: '新建文章' }
},
{
  path: 'posts/:id/edit',
  name: 'PostEdit',
  component: () => import('@/views/posts/PostEditor.vue'),
  meta: { title: '编辑文章' }
}
```

#### 步骤 2: 创建 PostEditor 组件

文件: `admin/src/views/posts/PostEditor.vue`

**功能模块**:

**A. 基本信息区域**
- [ ] 文章标题输入框（必填，实时验证）
- [ ] URL Slug 输入框（必填，自动生成，可编辑）
- [ ] 摘要输入框（多行文本，建议150-300字）
- [ ] 封面图选择（调用 MediaSelector 组件）
- [ ] 发布状态选择（草稿/已发布）
- [ ] 发布时间选择（日期时间选择器）

**B. 富文本编辑器**
- [ ] 集成 Quill 富文本编辑器
- [ ] 工具栏配置：
  - 标题（H1-H6）
  - 粗体、斜体、下划线、删除线
  - 列表（有序、无序）
  - 引用、代码块
  - 链接、图片插入
  - 对齐方式
  - 颜色选择
- [ ] 图片上传功能（拖拽或选择）
- [ ] 字数统计
- [ ] 全屏编辑模式

**C. 分类和标签**
- [ ] 分类选择器（TreeSelect，支持多选）
- [ ] 标签选择器（可搜索、可创建新标签）
- [ ] 快速创建分类/标签按钮

**D. SEO 设置**
- [ ] Meta 标题（默认使用文章标题）
- [ ] Meta 描述（默认使用摘要）
- [ ] Meta 关键词（标签形式）
- [ ] OG 图片（默认使用封面图）
- [ ] Canonical URL

**E. 高级设置**
- [ ] 评论开关（启用/禁用）
- [ ] 置顶设置
- [ ] 推荐文章标记
- [ ] 阅读次数（显示，不可编辑）

**F. 操作栏**
- [ ] 保存草稿按钮
- [ ] 发布/更新按钮
- [ ] 预览按钮（新窗口打开前台预览）
- [ ] 取消按钮（返回列表）
- [ ] 删除按钮（编辑模式）
- [ ] 自动保存功能（每30秒，防抖）
- [ ] 保存状态提示（已保存/保存中/有未保存更改）

**UI 结构参考**:
```vue
<template>
  <div class="post-editor">
    <n-page-header @back="handleBack">
      <template #title>
        {{ isEdit ? '编辑文章' : '新建文章' }}
      </template>
      <template #extra>
        <n-space>
          <n-tag v-if="saveStatus === 'saved'" type="success">已保存</n-tag>
          <n-tag v-if="saveStatus === 'saving'" type="info">保存中...</n-tag>
          <n-tag v-if="saveStatus === 'unsaved'" type="warning">有未保存更改</n-tag>
          <n-button @click="handleSaveDraft">保存草稿</n-button>
          <n-button type="primary" @click="handlePublish">
            {{ form.status === 'PUBLISHED' ? '更新' : '发布' }}
          </n-button>
        </n-space>
      </template>
    </n-page-header>

    <n-space vertical :size="16" style="margin-top: 16px">
      <!-- 基本信息卡片 -->
      <n-card title="基本信息">
        <n-form ref="formRef" :model="form" :rules="rules">
          <n-form-item label="文章标题" path="title">
            <n-input v-model:value="form.title" placeholder="请输入文章标题" />
          </n-form-item>
          <n-form-item label="URL Slug" path="slug">
            <n-input v-model:value="form.slug" placeholder="自动生成或手动输入" />
          </n-form-item>
          <n-form-item label="摘要" path="excerpt">
            <n-input
              v-model:value="form.excerpt"
              type="textarea"
              :rows="3"
              placeholder="请输入文章摘要（建议150-300字）"
              show-count
              :maxlength="500"
            />
          </n-form-item>
          <n-form-item label="封面图">
            <MediaSelector
              v-model="form.coverImage"
              :max-count="1"
              accept="image/*"
            />
          </n-form-item>
        </n-form>
      </n-card>

      <!-- 文章内容卡片 -->
      <n-card title="文章内容">
        <QuillEditor
          v-model:content="form.content"
          content-type="html"
          :toolbar="toolbarOptions"
          @text-change="handleContentChange"
        />
        <div class="word-count">
          字数：{{ wordCount }}
        </div>
      </n-card>

      <!-- 分类和标签卡片 -->
      <n-card title="分类和标签">
        <n-space vertical :size="16">
          <n-form-item label="分类">
            <n-tree-select
              v-model:value="form.categoryIds"
              :options="categoryOptions"
              multiple
              cascade
              checkable
              placeholder="选择分类"
            />
          </n-form-item>
          <n-form-item label="标签">
            <n-dynamic-tags v-model:value="form.tags">
              <template #input="{ submit, deactivate }">
                <n-auto-complete
                  size="small"
                  :options="tagSuggestions"
                  @select="submit"
                  @blur="deactivate"
                />
              </template>
            </n-dynamic-tags>
          </n-form-item>
        </n-space>
      </n-card>

      <!-- SEO 设置卡片 -->
      <n-card title="SEO 设置">
        <n-form>
          <n-form-item label="Meta 标题">
            <n-input v-model:value="form.seo.metaTitle" placeholder="默认使用文章标题" />
          </n-form-item>
          <n-form-item label="Meta 描述">
            <n-input
              v-model:value="form.seo.metaDescription"
              type="textarea"
              :rows="2"
              placeholder="默认使用文章摘要"
            />
          </n-form-item>
          <n-form-item label="关键词">
            <n-dynamic-tags v-model:value="form.seo.keywords" />
          </n-form-item>
        </n-form>
      </n-card>

      <!-- 高级设置卡片 -->
      <n-card title="高级设置">
        <n-space vertical :size="16">
          <n-form-item label="发布时间">
            <n-date-picker
              v-model:value="form.publishedAt"
              type="datetime"
              clearable
            />
          </n-form-item>
          <n-form-item label="评论">
            <n-switch v-model:value="form.allowComments" />
            <span style="margin-left: 8px">允许评论</span>
          </n-form-item>
          <n-form-item label="置顶">
            <n-switch v-model:value="form.isPinned" />
          </n-form-item>
          <n-form-item label="推荐">
            <n-switch v-model:value="form.isFeatured" />
          </n-form-item>
        </n-space>
      </n-card>
    </n-space>
  </div>
</template>
```

#### 步骤 3: 实现自动保存功能

```typescript
import { useDebounceFn } from '@vueuse/core'

// 自动保存（防抖）
const autoSave = useDebounceFn(() => {
  if (hasUnsavedChanges.value) {
    handleSaveDraft()
  }
}, 30000) // 30秒

// 监听表单变化
watch(form, () => {
  hasUnsavedChanges.value = true
  saveStatus.value = 'unsaved'
  autoSave()
}, { deep: true })
```

#### 步骤 4: 集成 Quill 编辑器

```bash
# 已安装，无需重新安装
npm list quill
```

配置:
```typescript
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ 'header': 1 }, { 'header': 2 }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  [{ 'direction': 'rtl' }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'font': [] }],
  [{ 'align': [] }],
  ['link', 'image', 'video'],
  ['clean']
]
```

#### 步骤 5: 编写测试

文件: `admin/tests/views/posts/PostEditor.spec.ts`

测试用例:
- [ ] 新建文章页面正常渲染
- [ ] 编辑文章页面正常加载数据
- [ ] 标题和 Slug 输入正常
- [ ] 富文本编辑器正常工作
- [ ] 封面图选择功能
- [ ] 分类选择功能
- [ ] 标签管理功能
- [ ] SEO 设置功能
- [ ] 保存草稿功能
- [ ] 发布文章功能
- [ ] 自动保存功能
- [ ] 表单验证
- [ ] 错误处理

**验收标准**:
- [ ] 可以新建文章并保存
- [ ] 可以编辑现有文章
- [ ] 富文本编辑器功能完整
- [ ] 分类和标签正确关联
- [ ] SEO 信息正确保存
- [ ] 自动保存工作正常
- [ ] 发布后文章状态正确更新

---

### Task 5: 实现产品管理功能 🟡

**重要性**: 电商展示的核心功能

#### 步骤 1: 替换产品列表占位页

文件: `admin/src/views/products/ProductList.vue`

**功能需求**:
- [ ] 产品列表展示（卡片或表格视图）
- [ ] 搜索功能（名称、SKU）
- [ ] 分类筛选
- [ ] 状态筛选（上架/下架）
- [ ] Featured 筛选
- [ ] 价格范围筛选
- [ ] 排序功能（按创建时间、价格、名称）
- [ ] 批量操作（批量上架/下架、批量删除）
- [ ] 新建产品按钮
- [ ] 编辑、删除按钮
- [ ] 分页功能

#### 步骤 2: 创建产品编辑器

文件: `admin/src/views/products/ProductEditor.vue`

**功能模块**:

**A. 基本信息**
- [ ] 产品名称（必填）
- [ ] URL Slug（自动生成）
- [ ] SKU（可选）
- [ ] 简短描述（多行文本）
- [ ] 价格（数字输入，可选）
- [ ] 原价（可选，用于显示折扣）

**B. 产品描述**
- [ ] 富文本编辑器（同文章）
- [ ] 或者使用区块编辑器（复用 PageEditor 的区块系统）

**C. 图片管理**
- [ ] 主图选择（必选）
- [ ] 图集管理（多图上传，拖拽排序）
- [ ] 图片预览
- [ ] 删除图片功能

**D. 规格参数**
- [ ] JSON 编辑器（键值对形式）
- [ ] 可视化编辑界面：
  - 参数名称
  - 参数值
  - 添加/删除参数
- [ ] 预定义模板（可选）

示例数据结构:
```json
{
  "尺寸": "60cm × 40cm × 45cm",
  "重量": "8kg",
  "种植位": "12株",
  "光源": "LED全光谱 24W",
  "水箱容量": "15L",
  "控制方式": "APP智能控制",
  "电源": "220V 50Hz",
  "保修期": "1年"
}
```

**E. 分类和标签**
- [ ] 分类选择（单选或多选）
- [ ] 标签选择

**F. SEO 设置**
- [ ] 同文章编辑器的 SEO 设置

**G. 产品设置**
- [ ] 上架/下架开关
- [ ] Featured 标记（推荐产品）
- [ ] 库存状态（有货/缺货/预售）
- [ ] 排序权重（数字）

**UI 结构参考**:
```vue
<template>
  <div class="product-editor">
    <n-page-header @back="handleBack">
      <template #title>
        {{ isEdit ? '编辑产品' : '新建产品' }}
      </template>
      <template #extra>
        <n-space>
          <n-button @click="handleSave">保存</n-button>
          <n-button type="primary" @click="handleSaveAndPublish">
            保存并{{ form.isActive ? '上架' : '下架' }}
          </n-button>
        </n-space>
      </template>
    </n-page-header>

    <n-grid :cols="24" :x-gap="16" style="margin-top: 16px">
      <!-- 左侧主要内容 -->
      <n-grid-item :span="16">
        <n-space vertical :size="16">
          <!-- 基本信息 -->
          <n-card title="基本信息">
            <n-form ref="formRef" :model="form" :rules="rules">
              <n-form-item label="产品名称" path="name">
                <n-input v-model:value="form.name" />
              </n-form-item>
              <n-form-item label="URL Slug" path="slug">
                <n-input v-model:value="form.slug" />
              </n-form-item>
              <n-form-item label="SKU">
                <n-input v-model:value="form.sku" />
              </n-form-item>
              <n-grid :cols="2" :x-gap="16">
                <n-grid-item>
                  <n-form-item label="价格">
                    <n-input-number v-model:value="form.price" :precision="2" :min="0">
                      <template #prefix>¥</template>
                    </n-input-number>
                  </n-form-item>
                </n-grid-item>
                <n-grid-item>
                  <n-form-item label="原价">
                    <n-input-number v-model:value="form.originalPrice" :precision="2" :min="0">
                      <template #prefix>¥</template>
                    </n-input-number>
                  </n-form-item>
                </n-grid-item>
              </n-grid>
              <n-form-item label="简短描述">
                <n-input
                  v-model:value="form.excerpt"
                  type="textarea"
                  :rows="3"
                />
              </n-form-item>
            </n-form>
          </n-card>

          <!-- 产品描述 -->
          <n-card title="详细描述">
            <QuillEditor v-model:content="form.description" />
          </n-card>

          <!-- 规格参数 -->
          <n-card title="规格参数">
            <n-space vertical :size="12">
              <n-space
                v-for="(spec, index) in form.specifications"
                :key="index"
                align="center"
              >
                <n-input
                  v-model:value="spec.name"
                  placeholder="参数名称"
                  style="width: 150px"
                />
                <n-input
                  v-model:value="spec.value"
                  placeholder="参数值"
                  style="flex: 1"
                />
                <n-button @click="removeSpec(index)" quaternary circle>
                  <template #icon>
                    <n-icon><TrashOutline /></n-icon>
                  </template>
                </n-button>
              </n-space>
              <n-button @click="addSpec" dashed block>添加参数</n-button>
            </n-space>
          </n-card>

          <!-- SEO 设置 -->
          <n-card title="SEO 设置">
            <!-- 同文章编辑器 -->
          </n-card>
        </n-space>
      </n-grid-item>

      <!-- 右侧侧边栏 -->
      <n-grid-item :span="8">
        <n-space vertical :size="16">
          <!-- 产品图片 -->
          <n-card title="产品图片" size="small">
            <n-space vertical :size="12">
              <div>
                <div class="label">主图</div>
                <MediaSelector
                  v-model="form.mainImage"
                  :max-count="1"
                  accept="image/*"
                />
              </div>
              <div>
                <div class="label">图集</div>
                <MediaSelector
                  v-model="form.gallery"
                  :max-count="10"
                  accept="image/*"
                  multiple
                />
              </div>
            </n-space>
          </n-card>

          <!-- 分类和标签 -->
          <n-card title="分类和标签" size="small">
            <n-space vertical :size="12">
              <n-form-item label="分类">
                <n-tree-select
                  v-model:value="form.categoryIds"
                  :options="categoryOptions"
                  multiple
                />
              </n-form-item>
              <n-form-item label="标签">
                <n-dynamic-tags v-model:value="form.tags" />
              </n-form-item>
            </n-space>
          </n-card>

          <!-- 产品设置 -->
          <n-card title="产品设置" size="small">
            <n-space vertical :size="12">
              <n-form-item label="上架状态">
                <n-switch v-model:value="form.isActive">
                  <template #checked>上架</template>
                  <template #unchecked>下架</template>
                </n-switch>
              </n-form-item>
              <n-form-item label="推荐产品">
                <n-switch v-model:value="form.isFeatured" />
              </n-form-item>
              <n-form-item label="库存状态">
                <n-select
                  v-model:value="form.stockStatus"
                  :options="stockStatusOptions"
                />
              </n-form-item>
              <n-form-item label="排序权重">
                <n-input-number v-model:value="form.sortOrder" :min="0" />
              </n-form-item>
            </n-space>
          </n-card>
        </n-space>
      </n-grid-item>
    </n-grid>
  </div>
</template>
```

#### 步骤 3: 编写测试

文件: `admin/tests/views/products/ProductList.spec.ts`
文件: `admin/tests/views/products/ProductEditor.spec.ts`

**验收标准**:
- [ ] 产品列表正常显示
- [ ] 搜索和筛选功能正常
- [ ] 可以新建产品
- [ ] 可以编辑产品
- [ ] 规格参数可以正常添加/编辑/删除
- [ ] 图集管理正常
- [ ] 上架/下架功能正常
- [ ] Featured 标记正常工作

---

## 🟢 第三阶段：完善辅助功能（P2）

**目标**: 完善站点设置、用户管理、表单管理
**时间**: 3-5天
**优先级**: 中等

### Task 6: 完善站点设置

**主题设置 Tab**:
- [ ] 主色调选择器（Color Picker）
- [ ] 辅助色选择器
- [ ] 字体选择（字体族、字号、行高）
- [ ] 圆角设置（Slider）
- [ ] 阴影设置
- [ ] 实时预览（在 iframe 中预览）

**SEO 设置 Tab**:
- [ ] 默认 Meta 标题模板
- [ ] 默认 Meta 描述模板
- [ ] 默认 OG 图片上传
- [ ] Google Analytics ID
- [ ] Google Search Console 验证码
- [ ] 百度统计代码
- [ ] 自定义 Head Scripts

**其他设置**:
- [ ] Logo 上传（主 Logo + 小 Logo）
- [ ] Favicon 上传
- [ ] ICP 备案号
- [ ] 公安备案号
- [ ] 社交媒体链接（微信、微博、抖音等）
- [ ] 联系方式（电话、邮箱、地址）

---

### Task 7: 完善用户管理

- [ ] 创建用户对话框
  - 邮箱、显示名称
  - 角色选择
  - 密码设置
- [ ] 编辑用户对话框
  - 修改基本信息
  - 更改角色
  - 重置密码
- [ ] 角色权限说明卡片
- [ ] 权限矩阵展示（表格形式）
- [ ] 删除用户确认
- [ ] 批量操作

---

### Task 8: 完善表单管理

- [ ] 提交详情对话框
  - 显示所有提交字段
  - 显示用户信息（IP、UA）
  - 提交时间
- [ ] 标记已读/未读功能
- [ ] 备注功能（内部使用）
- [ ] 导出 CSV 功能
  - 导出当前页
  - 导出全部
  - 导出筛选结果
- [ ] 删除提交功能

---

## 🔵 第四阶段：全局优化与测试（P3）

**目标**: 优化用户体验，提升性能，完善测试
**时间**: 3-5天
**优先级**: 低

### Task 9: 全局功能优化

**全局搜索**:
- [ ] 顶部搜索框实现
- [ ] 搜索所有内容类型（页面、文章、产品、用户）
- [ ] 搜索结果页面（分类展示）
- [ ] 快捷键支持（Cmd/Ctrl + K）

**主题切换**:
- [ ] 亮色/暗色模式完善
- [ ] 主题选择持久化（localStorage）
- [ ] 跟随系统主题

**多语言框架**:
- [ ] 配置 vue-i18n
- [ ] 提取所有文本到语言文件
- [ ] 语言切换器

**其他优化**:
- [ ] 面包屑导航优化
- [ ] 错误处理统一化
- [ ] 加载状态统一化
- [ ] 空状态优化

---

### Task 10: 性能与测试优化

**响应式优化**:
- [ ] 移动端布局适配
- [ ] 平板端布局适配
- [ ] 触摸手势支持

**无障碍支持**:
- [ ] ARIA 标签添加
- [ ] 键盘导航支持
- [ ] 屏幕阅读器支持
- [ ] 焦点管理

**性能优化**:
- [ ] 路由级代码分割
- [ ] 组件懒加载
- [ ] 图片懒加载
- [ ] 打包体积优化

**测试完善**:
- [ ] 完善组件单元测试
- [ ] E2E 测试（Playwright）
- [ ] 浏览器兼容性测试
- [ ] 性能测试（Lighthouse）

**文档完善**:
- [ ] 用户操作手册
- [ ] 开发者文档
- [ ] API 对接文档
- [ ] 部署文档

---

## 📊 进度追踪

### 完成度统计

| 阶段 | 任务数 | 已完成 | 进行中 | 未开始 | 完成率 |
|------|--------|--------|--------|--------|--------|
| 🔴 第一阶段 | 3 | 0 | 0 | 3 | 0% |
| 🟡 第二阶段 | 2 | 0 | 0 | 2 | 0% |
| 🟢 第三阶段 | 3 | 0 | 0 | 3 | 0% |
| 🔵 第四阶段 | 2 | 0 | 0 | 2 | 0% |
| **总计** | **10** | **0** | **0** | **10** | **0%** |

### 时间估算

| 阶段 | 预计时间 | 实际时间 | 状态 |
|------|----------|----------|------|
| 🔴 第一阶段 | 1-2天 | - | 未开始 |
| 🟡 第二阶段 | 5-7天 | - | 未开始 |
| 🟢 第三阶段 | 3-5天 | - | 未开始 |
| 🔵 第四阶段 | 3-5天 | - | 未开始 |
| **总计** | **12-19天** | **-** | - |

---

## 🎯 本周目标（Week 1）

### Day 1: 修复关键问题
- [x] ~~完成功能测试并生成报告~~
- [ ] 修复侧边栏导航点击事件
- [ ] 创建审计日志页面和路由
- [ ] 修复文章状态和分类关联

### Day 2-3: 文章编辑器
- [ ] 创建 PostEditor 基础结构
- [ ] 集成 Quill 富文本编辑器
- [ ] 实现基本信息表单
- [ ] 实现分类和标签选择

### Day 4-5: 文章编辑器完善
- [ ] 实现 SEO 设置
- [ ] 实现封面图选择
- [ ] 实现自动保存
- [ ] 编写测试用例

---

## 📝 开发规范

### TDD 开发流程

1. **Red**: 先编写测试用例（测试失败）
2. **Green**: 实现最小可用代码（测试通过）
3. **Refactor**: 重构优化代码
4. **Verify**: 功能测试验证

### 代码规范

- 遵循 ESLint 和 Prettier 配置
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case
- 使用 TypeScript 类型注解
- 编写 JSDoc 注释

### Git 提交规范

```
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具链
```

---

## 🔗 相关文档

- [功能测试报告 (2025-10-24)](./FUNCTIONAL_TEST_REPORT_2025-10-24.md)
- [实施计划](./ADMIN_IMPLEMENTATION_PLAN.md)
- [PRD 文档](../CMS-PRD-v1.0.md)
- [执行计划](../CMS-v1.0-Execution-Plan.md)
- [种子数据设计](../SEED_DATA_DESIGN.md)

---

**更新日期**: 2025-10-24
**制定人**: Claude Code (AI Assistant)
**审核状态**: 待审核
