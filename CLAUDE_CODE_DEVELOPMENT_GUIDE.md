# 使用 Claude Code 构建企业级 CMS 系统完全指南

## 前言

本文记录了使用 **Claude Code** (配合 GLM4.6 模型) 在短短两天时间内完成 **Docms CMS** 项目 85% 核心功能的完整开发历程。通过本文,您将了解到:

- 如何使用 AI 编程助手快速构建全栈项目
- 有效的提示词策略和最佳实践
- TDD (测试驱动开发) 如何防止 AI "幻觉"
- 项目文档驱动开发的重要性
- 常见陷阱和解决方案

---

## 目录

1. [项目概述](#项目概述)
2. [开发历程回顾](#开发历程回顾)
3. [Claude Code 提示词策略](#claude-code-提示词策略)
4. [关键提示词示例](#关键提示词示例)
5. [最佳实践总结](#最佳实践总结)
6. [注意事项和常见陷阱](#注意事项和常见陷阱)
7. [成果展示](#成果展示)
8. [结论](#结论)

---

## 项目概述

### Docms CMS 简介

**Docms** 是一个单站点、开源、自托管的企业级内容管理系统,专为现代企业网站设计。项目采用前后端分离架构,提供直觉式的管理后台和强大的区块化内容编辑能力。

### 技术栈

**后端 (API)**
```
框架: NestJS 11.1.7 + Fastify 4.21.0
数据库: SQLite + Prisma ORM 6.17.1
认证: JWT + Passport
文档: Swagger/OpenAPI
```

**前端 (Admin)**
```
框架: Vue 3.5.22 + TypeScript 5.9.3
构建工具: Vite 7.1.7
UI 库: Naive UI 2.40.1
状态管理: Pinia 2.2.8
路由: Vue Router 4.4.5
```

**测试框架**
```
后端: Jest 30.2.0 + Supertest 7.1.4
前端: Vitest 2.1.8 + Vue Test Utils 2.4.6
覆盖率: @vitest/coverage-v8
```

### 核心架构特点

#### 1. 区块化内容系统
所有页面由可复用的区块 (Block) 组成:
- 12 种核心区块类型 (Hero、Text、ImageGallery、Features、CTA 等)
- 区块配置存储为 JSON
- 拖拽排序和可视化编辑

#### 2. 动态菜单导航
创新的 UX 设计理念:
- 网站栏目即为主导航
- 三种栏目类型: Page (单页)、PostList (文章列表)、Product (产品)
- 左侧导航自动生成,零配置

#### 3. TDD 开发模式
严格的测试驱动开发:
- Store 层测试覆盖率 > 90%
- 组件测试覆盖率 > 80%
- API 测试 100% 通过 (35/35)
- 总计 100+ 测试用例

### 项目规模

- **代码量**: 约 32,000-35,000 行 (代码 + 文档)
- **模块数**: 12 个完整功能模块
- **测试数**: 100+ 单元测试 + 集成测试
- **文档数**: 20+ 份详细文档
- **开发时长**: 约 20 天 (单人开发)
- **完成度**: 85% (核心功能完成)

---

## 开发历程回顾

### 阶段 0: 项目规划 (Day 1-2)

#### 初始文档编写

最开始并非直接写代码,而是花费了大量时间编写详细的需求文档:

1. **CMS-PRD-v1.0.md** (30KB)
   - 产品需求规格说明书
   - 功能清单和优先级
   - 数据库模型设计
   - 用户角色和权限

2. **CMS-v1.0-Execution-Plan.md** (11KB)
   - AI 辅助实施计划
   - 5 个开发阶段
   - 技术选型说明
   - 时间估算

3. **ADMIN_IMPLEMENTATION_PLAN.md** (1047 行)
   - 管理后台详细实现计划
   - 按模块划分的任务清单
   - TDD 测试策略

**关键洞察**: 完善的文档是 AI 辅助开发的基础。这些文档后来成为了 CLAUDE.md 的核心内容,指导 AI 理解项目架构和业务逻辑。

### 阶段 1: 项目基建 (Day 3-4)

#### 任务清单
- ✅ 初始化 Vite + Vue3 + TypeScript 项目
- ✅ 配置 NestJS + Prisma + SQLite 后端
- ✅ 设置 Naive UI 主题系统
- ✅ 配置 Pinia 状态管理
- ✅ 设置 Vue Router 路由
- ✅ 配置 Vitest 测试环境
- ✅ Docker Compose 开发环境

**时间消耗**: 约 2 天
**代码量**: 约 2,000 行 (配置文件为主)

#### 使用的提示词模式

```
我需要初始化一个全栈 CMS 项目:

【技术栈】
- 前端: Vue 3 + TypeScript + Vite + Naive UI
- 后端: NestJS + Fastify + Prisma + SQLite
- 测试: Vitest + Jest

【要求】
1. 创建标准的 monorepo 结构 (admin/ api/)
2. 配置 TypeScript 严格模式
3. 设置 ESLint 和 Prettier
4. 配置开发环境的 Docker Compose
5. 创建 start-dev 启动脚本

【注意事项】
- 所有依赖使用最新稳定版本
- 配置热重载开发环境
- 设置 path alias (@/ 映射到 src/)

请按照最佳实践配置,并生成项目结构图。
```

**关键要点**:
- 明确技术栈版本
- 列出具体配置需求
- 强调最佳实践
- 要求生成文档

### 阶段 2: 认证与布局 (Day 5-7)

#### 功能实现
- ✅ 登录页面 (JWT 认证)
- ✅ 认证状态管理 (Pinia Store)
- ✅ 路由守卫 (自动跳转)
- ✅ 主布局组件 (Header + Sidebar)
- ✅ 16 个认证模块测试

**时间消耗**: 约 3 天
**代码量**: 约 3,000 行 (含测试)

#### TDD 提示词模式

```
我需要实现用户认证模块,使用 TDD 开发模式:

【第一步: 编写测试】
请先编写 AuthStore 的单元测试,覆盖以下场景:
1. 登录成功 - Token 存储到 localStorage
2. 登录失败 - 显示错误消息
3. 退出登录 - 清除 Token 和用户信息
4. Token 过期 - 自动刷新或跳转登录
5. 页面刷新 - 从 localStorage 恢复用户状态

测试文件: tests/stores/auth.spec.ts
使用 Vitest + happy-dom

【第二步: 实现功能】
等测试编写完成后,我会让你实现 AuthStore 代码。

【禁止】
- 不要在第一步就实现功能代码
- 不要跳过测试直接写实现
```

**关键洞察**: TDD 是防止 AI "幻觉"的最有效方法。先写测试,AI 就有了明确的目标,不会偏离需求。

### 阶段 3: 动态菜单导航 (Day 7-8)

#### 功能实现
- ✅ 菜单数据模型 (Prisma Schema)
- ✅ 菜单 API 接口 (8 个端点)
- ✅ 菜单树形结构构建
- ✅ 左侧动态导航组件
- ✅ 菜单状态管理 (Pinia)
- ✅ 11 个菜单测试

**时间消耗**: 约 1.5 天
**代码量**: 约 2,500 行

#### 复杂逻辑提示词

```
我需要实现动态菜单导航系统,这是本项目的核心 UX 创新:

【业务逻辑】
1. 菜单项有三种类型:
   - PAGE: 单页栏目 (如首页、关于我们)
   - POST_LIST: 文章列表栏目 (如新闻、博客)
   - PRODUCT: 产品栏目

2. 左侧导航自动生成:
   - 从 API 获取菜单树结构
   - 根据 type 路由到不同编辑器:
     * PAGE -> /pages/:menuItemId/edit
     * POST_LIST -> /posts?menuItemId=xxx
     * PRODUCT -> /products?menuItemId=xxx

3. 树形结构支持:
   - 无限层级嵌套
   - 拖拽排序
   - 展开/折叠状态持久化

【技术要求】
- 使用 Naive UI 的 n-menu 组件
- Pinia Store 管理菜单状态
- 递归构建树形数据
- 路由守卫检查菜单权限

【测试要求】
先编写 MenuStore 的单元测试,覆盖:
- 菜单树构建算法
- 根据 ID 查找菜单项
- 根据 type 生成路由路径

请按照 TDD 模式开发。
```

**关键要点**:
- 详细描述业务逻辑
- 提供路由映射规则
- 明确技术实现方案
- 强调测试优先

### 阶段 4: 核心模块开发 (Day 9-18)

这是开发最密集的阶段,按以下顺序实现了 8 个核心模块:

#### 模块 1: 菜单管理 (Day 9-11, 3天)
- **功能**: 树形菜单 CRUD、拖拽排序、类型配置
- **代码量**: 约 2,000 行
- **测试**: 18 个测试用例

#### 模块 2: 媒体库 (Day 12-15, 4天)
- **功能**: 文件上传、网格/列表视图、媒体选择器
- **代码量**: 约 3,500 行
- **测试**: 38 个测试用例
- **亮点**: 拖拽上传、批量操作、MIME 类型筛选

#### 模块 3: 页面管理 (Day 16-18, 3天)
- **功能**: 12 种区块编辑器、拖拽排序、实时预览
- **代码量**: 约 4,000 行
- **测试**: 32 个测试用例
- **亮点**: 区块配置组件、JSON 存储

#### 模块 4: 文章管理 (Day 16-18, 3天)
- **功能**: Quill 富文本编辑器、分类标签、SEO 设置
- **代码量**: 约 3,000 行
- **测试**: 13 个测试用例
- **亮点**: 封面图片上传、自动保存

#### 模块 5-8: 分类、标签、产品、用户 (Day 16-18)
- 分类管理: 树形结构、快速添加
- 标签管理: 标签云、一键删除
- 产品管理: 规格编辑、图集管理 (3.5 小时完成!)
- 用户管理: 列表、角色筛选

**总时间消耗**: 约 10 天
**总代码量**: 约 20,000 行 (含测试)

#### 高效模块开发提示词模板

```
【任务】实现文章管理模块 (PostEditor)

【参考实现】
我已经实现了 PageEditor (区块编辑器),请参考以下文件:
- admin/src/views/pages/PageEditor.vue (682 行)
- admin/tests/views/pages/PageEditor.spec.ts (15 tests)

【功能需求】
PostEditor 应包含以下 Tab:
1. 基本信息:
   - 标题、Slug、摘要
   - 所属栏目选择 (menuItemId)
   - 分类多选 (categoryIds[])
   - 标签多选 (tagIds[])
   - Quill 富文本编辑器
   - 封面图片上传 (复用 MediaSelector)

2. SEO 设置:
   - SEO 标题 (max 60 字符,显示计数器)
   - SEO 描述 (max 160 字符,显示计数器)
   - SEO 关键词 (动态标签)

【API 接口】
- GET /posts/:id - 获取文章详情
- POST /posts - 创建文章
- PATCH /posts/:id - 更新文章
- POST /posts/:id/publish - 发布
- POST /posts/:id/unpublish - 取消发布

【表单验证规则】
- 标题: required
- Slug: required, pattern: /^[a-z0-9-]+$/
- 内容: required
- 栏目: required

【Header 操作按钮】
- 创建模式: [保存] 按钮
- 编辑模式: [保存] [发布/取消发布] 按钮,右侧显示状态徽章

【开发步骤】
1. 先编写 PostEditor.spec.ts 测试 (至少 10 个测试)
2. 实现 PostEditor.vue 组件
3. 运行测试确保通过
4. 进行功能测试并生成测试报告

【预期交付】
- admin/src/views/posts/PostEditor.vue (~600 行)
- admin/tests/views/posts/PostEditor.spec.ts (~250 行)
- POSTEDITOR_DEVELOPMENT_SUMMARY.md (开发总结)

请按照 TDD 模式开发,先测试后实现。
```

**成功要素**:
1. **参考现有实现**: 告诉 AI 参考哪些已完成的代码
2. **详细需求列表**: 不遗漏任何功能点
3. **明确 API 接口**: 提供后端接口规格
4. **表单验证规则**: 列出所有验证逻辑
5. **预期交付物**: 明确文件名和代码行数
6. **强制 TDD**: 先测试后实现

### 阶段 5: Bug 修复和完善 (Day 19-20)

#### 主要问题修复

**问题 1: 文章状态显示错误**
- 症状: 所有文章显示"草稿"
- 原因: 前后端枚举大小写不匹配
- 修复: 前端统一使用 `toUpperCase()`
- 耗时: 20 分钟

**问题 2: 文章分类不显示**
- 症状: 分类列显示"-"
- 原因: API 未包含关联查询
- 修复: 添加 Prisma `include` 关系
- 耗时: 40 分钟

**问题 3: 页面导入错误**
- 症状: `Failed to resolve import "./request"`
- 原因: 相对路径错误
- 修复: 改为 `'@/utils/request'`
- 耗时: 5 分钟

#### Bug 修复提示词

```
【Bug 报告】文章分类列显示为"-"

【现象】
在 PostList 页面,所有文章的"分类"列显示"-",但数据库中确实有分类数据。

【调试信息】
1. 前端代码 (PostList.vue line 158):
   ```
   row.categoryIds?.length > 0 ? '有分类' : '-'
   ```

2. API 响应 (GET /posts):
   ```json
   {
     "data": [
       {
         "id": "1",
         "title": "test",
         "categoryIds": undefined  // ❌ 问题在这
       }
     ]
   }
   ```

3. 数据库数据 (PostCategory 表):
   ```
   postId=1, categoryId=2 存在记录
   ```

【分析】
API 的 findAll 方法未包含关联数据,需要:
1. 添加 Prisma include 查询 postCategories 关系
2. 转换数据格式,提取 categoryIds 数组

【期望修复】
请修改 `api/src/post/post.service.ts` 的 findAll 方法:
1. 添加 include: { postCategories: { include: { category: true } } }
2. 在返回前转换数据:
   ```typescript
   categoryIds: post.postCategories?.map(pc => pc.categoryId) || []
   ```

【测试验证】
修复后请重启 API,并在 PostList 页面验证分类列是否正确显示。
```

**关键要点**:
1. **完整现象描述**: 什么功能不正常
2. **提供调试信息**: 代码片段、API 响应、数据库数据
3. **分析问题原因**: 告诉 AI 你的推理
4. **明确修复方向**: 具体要修改哪个文件
5. **验证步骤**: 如何确认修复成功

---

## Claude Code 提示词策略

### 1. CLAUDE.md 配置策略

CLAUDE.md 是 Claude Code 的"项目说明书",会自动加载到每次对话的上下文中。

#### 优秀的 CLAUDE.md 结构

```markdown
# CLAUDE.md

## 项目概览
- **名称**: Docms CMS
- **定位**: 单站点、自托管企业内容管理系统
- **当前阶段**: 核心功能开发 (85% 完成)
- **技术栈**: Vue3 + NestJS + Prisma + SQLite

## 项目结构
```
docms/
├── admin/          # Vue3 管理后台
│   ├── src/
│   │   ├── views/      # 页面组件
│   │   ├── components/ # 公共组件
│   │   ├── stores/     # Pinia 状态
│   │   └── api/        # API 封装
│   └── tests/      # Vitest 测试
├── api/            # NestJS 后端
│   ├── src/
│   │   ├── auth/       # 认证模块
│   │   ├── post/       # 文章模块
│   │   └── ...
│   └── prisma/     # 数据库 Schema
└── docs/           # 项目文档
```

## 核心架构
### 1. 区块化内容系统
- 所有页面由区块组成
- 12 种区块类型 (Hero, Text, ImageGallery...)
- 区块配置存储为 JSON

### 2. 动态菜单导航
- 三种栏目类型: PAGE, POST_LIST, PRODUCT
- 左侧导航自动生成
- 路由映射规则:
  * PAGE -> /pages/:id/edit
  * POST_LIST -> /posts?menuItemId=:id
  * PRODUCT -> /products?menuItemId=:id

## 开发规范
### TDD 开发模式
- **所有功能必须先写测试**
- Store 测试覆盖率 > 90%
- 组件测试覆盖率 > 80%

### 代码风格
- TypeScript 严格模式
- Vue 3 Composition API
- 使用 Pinia (不是 Vuex)
- 使用 Naive UI (不是 Element Plus)

### API 规范
- RESTful 设计
- JWT 认证
- 统一响应格式:
  ```typescript
  { success: boolean, data: any, message?: string }
  ```

## 已完成功能
- ✅ 用户认证 (16 tests)
- ✅ 菜单管理 (18 tests)
- ✅ 媒体库 (38 tests)
- ✅ 页面管理 (32 tests)
- ✅ 文章管理 (13 tests)
- ✅ 产品管理 (28 tests)

## 待开发功能
- ⏳ 前端网站 (Nuxt 3)
- ⏳ 主题设置
- ⏳ SEO 优化

## 技术决策记录
### 为什么选择 SQLite?
- 单站点无需复杂数据库
- 零配置,文件级备份
- Prisma 完美支持

### 为什么选择 Naive UI?
- TypeScript 原生支持
- Vue 3 Composition API 友好
- 无需额外配置

## 常见问题
### 如何启动开发环境?
```bash
./start-dev.sh  # 同时启动 API + Admin
```

### 如何运行测试?
```bash
cd admin && npm test     # 前端测试
cd api && npm run test:e2e # 后端测试
```

### 测试数据库账号
- Owner: owner@hydroponics.com / Password123
- Admin: admin@hydroponics.com / Password123
```

#### CLAUDE.md 编写技巧

1. **项目上下文优先**: 放在最前面,每次对话都能理解项目背景
2. **结构化描述**: 使用清晰的标题和列表
3. **技术决策记录**: 解释为什么选择某个技术,避免 AI 建议替换
4. **已完成功能**: 让 AI 知道哪些可以参考复用
5. **开发规范**: 强制 AI 遵循项目约定
6. **常见命令**: 减少重复询问

### 2. 分阶段提示词策略

#### 阶段 0: 项目初始化

```
【任务】初始化 Docms CMS 项目

【背景】
我要构建一个企业级 CMS,技术栈是 Vue3 + NestJS。
已编写详细 PRD 文档 (见 CMS-PRD-v1.0.md)。

【第一步】分析 PRD
请仔细阅读 CMS-PRD-v1.0.md,理解:
1. 核心功能需求
2. 数据库模型设计
3. 用户角色和权限

然后生成:
- 项目目录结构
- 技术栈清单
- 开发阶段划分

【第二步】生成 Prisma Schema
根据 PRD 第 6 节"数据库模型",生成完整的 schema.prisma:
- 11 个主要模型
- 关系定义
- 索引优化

【第三步】初始化项目
生成以下配置:
- package.json (admin + api)
- tsconfig.json
- vite.config.ts
- nest-cli.json
- docker-compose.yml
- .env.example

【交付】
- 完整项目结构
- 所有配置文件
- 启动脚本 (start-dev.sh)
- README.md 使用说明
```

#### 阶段 1: 认证模块 (TDD 模式)

```
【任务】实现用户认证模块 (TDD 模式)

【第一步: 编写测试】
创建 tests/stores/auth.spec.ts,测试以下场景:

1. 登录成功流程
   - 调用 login('email', 'password')
   - Token 存储到 localStorage
   - 用户信息存储到 Store
   - 返回 true

2. 登录失败流程
   - API 返回 401
   - 显示错误消息
   - Token 不被存储
   - 返回 false

3. 退出登录流程
   - 调用 logout()
   - 清除 localStorage
   - 清除 Store 用户信息
   - 跳转到登录页

4. Token 刷新流程
   - Token 即将过期
   - 自动调用 refresh API
   - 更新 localStorage Token

5. 页面刷新恢复
   - 从 localStorage 读取 Token
   - 验证 Token 有效性
   - 恢复用户信息

【要求】
- 使用 Vitest + happy-dom
- Mock axios 请求
- 至少 16 个测试用例
- 所有测试初始为 FAIL 状态

【禁止】
- 不要在这一步实现 Store 代码
- 只写测试,不写实现

完成后告诉我:"认证测试编写完成,16 个测试待通过"
```

```
【第二步: 实现功能】
现在实现 AuthStore,使所有测试通过:

【要求】
- 使用 Pinia defineStore
- JWT Token 存储到 localStorage
- axios 拦截器自动添加 Bearer Token
- 错误处理和消息提示

【API 接口】
- POST /auth/login - 登录
- POST /auth/logout - 登出
- POST /auth/refresh - 刷新 Token

【State】
```typescript
{
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}
```

【Actions】
- login(email, password)
- logout()
- refreshToken()
- loadUserFromStorage()

完成后运行 `npm test`,确保所有测试通过。
```

#### 阶段 2: 复杂组件开发

```
【任务】实现页面编辑器 (区块系统)

【参考文档】
- CMS-PRD-v1.0.md 第 4.2 节 (区块编辑器)
- admin/ADMIN_IMPLEMENTATION_PLAN.md 阶段 6

【复杂度分析】
这是项目中最复杂的组件,包含:
- 12 种区块类型
- 拖拽排序
- 区块配置面板
- JSON 数据持久化

【分解策略】
我们分 4 步实现:

**Step 1: 区块类型定义**
创建 src/config/blocks.ts,定义:
```typescript
export interface BlockType {
  type: string
  label: string
  icon: string
  defaultProps: Record<string, any>
}

export const BLOCK_TYPES: BlockType[] = [
  {
    type: 'hero',
    label: 'Hero 横幅',
    icon: 'image-outline',
    defaultProps: {
      title: '',
      subtitle: '',
      backgroundImage: '',
      ctaText: '了解更多',
      ctaLink: ''
    }
  },
  // ... 其他 11 种区块
]
```

**Step 2: 区块配置组件**
为每种区块创建配置组件,例如:
- components/blocks/HeroBlockConfig.vue
- components/blocks/TextBlockConfig.vue
- ...

**Step 3: PageEditor 主组件**
实现 views/pages/PageEditor.vue:
- 左侧: 区块列表 (已添加的区块)
- 中间: 区块预览
- 右侧: 当前区块配置面板
- 顶部: 页面基本信息 + 保存/发布按钮

**Step 4: 拖拽排序**
使用 VueDraggable 实现区块拖拽:
```vue
<draggable v-model="blocks" item-key="id">
  <template #item="{ element }">
    <BlockItem :block="element" @edit="editBlock" />
  </template>
</draggable>
```

【测试策略】
- 15 个组件测试
- 覆盖区块添加、删除、排序、配置

【预估时间】
- 区块类型定义: 30 分钟
- 配置组件 (12 个): 4 小时
- PageEditor 主组件: 3 小时
- 拖拽排序: 1 小时
- 测试编写: 2 小时
- 总计: 约 3 天

请先从 Step 1 开始,每完成一步告诉我进度。
```

### 3. 渐进式复杂度策略

处理复杂功能时,不要一次性要求 AI 完成所有功能,而是逐步添加:

#### 示例: 产品管理模块

**第一版: 基础 CRUD**
```
实现 ProductList 基础功能:
- 产品列表展示 (表格)
- 搜索功能 (名称)
- 分页 (20 per page)
- 创建/编辑/删除按钮
```

**第二版: 添加筛选**
```
增强 ProductList 筛选功能:
- 状态筛选 (激活/未激活)
- 分类筛选 (下拉菜单)
- 重置筛选按钮
```

**第三版: 添加批量操作**
```
添加批量操作功能:
- 表格多选 (checkbox)
- 批量删除
- 批量激活/停用
- 选中数量提示
```

**第四版: 优化 UX**
```
优化用户体验:
- 添加 loading 状态
- 空状态提示
- 确认对话框
- 成功/错误消息
- 表格列宽优化
```

### 4. 参考现有代码策略

当实现相似功能时,明确告诉 AI 参考哪些已完成的代码:

```
【任务】实现 ProductEditor

【参考】
我已经实现了 PostEditor (文章编辑器):
- 文件: admin/src/views/posts/PostEditor.vue (643 行)
- 测试: admin/tests/views/posts/PostEditor.spec.ts (13 tests)

ProductEditor 应该遵循相同的模式:
- Tab 布局 (基本信息、规格参数、图集、SEO)
- MediaSelector 封面图片上传
- Form 验证规则
- Header 操作按钮布局
- 自动保存机制

【不同点】
ProductEditor 特有功能:
1. 规格参数编辑器 (动态添加/删除)
   ```typescript
   specs: [
     { key: 'capacity', label: '容量', value: '48', unit: '株' },
     { key: 'power', label: '功率', value: '100', unit: 'W' }
   ]
   ```

2. 图集管理 (多图上传)
   - 上传按钮: 打开拖拽上传模态框
   - 选择按钮: 打开媒体库选择器
   - 图片网格: 显示缩略图 + 删除按钮

请参考 PostEditor 的结构,实现 ProductEditor。
```

---

## 关键提示词示例

### 1. 项目初始化提示词

```markdown
# 项目初始化完整提示词

【背景】
我要构建一个企业级 CMS 系统 (Docms),单站点、自托管、区块化内容管理。

【技术栈】
**后端:**
- NestJS 11+ (使用 Fastify 适配器)
- Prisma 6+ + SQLite
- JWT 认证
- Passport
- Swagger 文档

**前端:**
- Vue 3.5+ (Composition API)
- TypeScript 5.9+
- Vite 7+
- Naive UI 2.40+
- Pinia 2.2+
- Vue Router 4.4+

**测试:**
- Vitest (前端)
- Jest + Supertest (后端)
- Vue Test Utils
- Happy DOM

【项目结构】
```
docms/
├── admin/               # 前端管理后台
│   ├── src/
│   │   ├── api/           # API 封装
│   │   ├── assets/        # 静态资源
│   │   ├── components/    # 公共组件
│   │   │   ├── layout/      # 布局组件
│   │   │   ├── blocks/      # 区块配置组件
│   │   │   └── media/       # 媒体组件
│   │   ├── router/        # 路由配置
│   │   ├── stores/        # Pinia stores
│   │   ├── types/         # TypeScript 类型
│   │   ├── utils/         # 工具函数
│   │   ├── views/         # 页面组件
│   │   │   ├── auth/        # 认证页面
│   │   │   ├── dashboard/   # 仪表盘
│   │   │   ├── menu/        # 菜单管理
│   │   │   ├── media/       # 媒体库
│   │   │   ├── pages/       # 页面管理
│   │   │   ├── posts/       # 文章管理
│   │   │   ├── products/    # 产品管理
│   │   │   ├── categories/  # 分类管理
│   │   │   ├── tags/        # 标签管理
│   │   │   ├── forms/       # 表单管理
│   │   │   ├── site/        # 站点设置
│   │   │   ├── users/       # 用户管理
│   │   │   └── audit/       # 审计日志
│   │   ├── App.vue
│   │   └── main.ts
│   ├── tests/           # Vitest 测试
│   │   ├── stores/
│   │   ├── components/
│   │   └── views/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── vitest.config.ts
│
├── api/                 # 后端 API
│   ├── src/
│   │   ├── auth/          # 认证模块
│   │   ├── user/          # 用户模块
│   │   ├── menu/          # 菜单模块
│   │   ├── page/          # 页面模块
│   │   ├── post/          # 文章模块
│   │   ├── category/      # 分类模块
│   │   ├── tag/           # 标签模块
│   │   ├── product/       # 产品模块
│   │   ├── media/         # 媒体模块
│   │   ├── site/          # 站点模块
│   │   ├── form-submission/ # 表单提交模块
│   │   ├── blocks/        # 区块系统
│   │   ├── common/        # 公共模块
│   │   │   ├── guards/      # 守卫
│   │   │   ├── decorators/  # 装饰器
│   │   │   └── services/    # 公共服务
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── test/            # E2E 测试
│   ├── package.json
│   ├── nest-cli.json
│   └── tsconfig.json
│
├── docker-compose.yml   # 开发环境
├── start-dev.sh         # 启动脚本
├── CLAUDE.md            # Claude Code 配置
└── README.md
```

【第一步】生成配置文件
请生成以下配置文件:

1. **admin/package.json**
   - 包含所有前端依赖
   - 脚本: dev, build, test, lint

2. **api/package.json**
   - 包含所有后端依赖
   - 脚本: start:dev, build, test:e2e

3. **admin/vite.config.ts**
   - 配置 path alias (@/ -> src/)
   - Vue 插件
   - 开发服务器端口: 5173

4. **admin/vitest.config.ts**
   - happy-dom 环境
   - 覆盖率配置

5. **api/tsconfig.json**
   - 严格模式
   - 装饰器支持

6. **docker-compose.yml**
   - API 服务 (端口 3000)
   - Admin 服务 (端口 5173)

【第二步】生成 Prisma Schema
根据以下模型生成 schema.prisma:

**核心模型:**
- User (用户)
- Site (站点配置)
- MenuItem (菜单项)
- Category (分类)
- Tag (标签)
- Page (页面)
- Post (文章)
- Product (产品)
- Media (媒体)
- FormSubmission (表单提交)
- AuditLog (审计日志)

**关系表:**
- PostCategory (文章-分类多对多)
- PostTag (文章-标签多对多)
- PageVersion (页面版本历史)

【第三步】生成启动脚本
创建 start-dev.sh:
```bash
#!/bin/bash
# 停止现有服务
# 启动 API (端口 3000)
# 启动 Admin (端口 5173)
# 显示日志
```

【交付清单】
- [ ] 所有配置文件
- [ ] 完整的 Prisma Schema
- [ ] 启动脚本
- [ ] 基础的 README.md
- [ ] .env.example 文件
- [ ] .gitignore 文件

【注意事项】
1. 所有依赖使用最新稳定版本
2. TypeScript 严格模式
3. ESLint + Prettier 配置
4. 配置 path alias
5. 开发环境热重载

请按顺序完成,每完成一步告诉我进度。
```

### 2. TDD 测试编写提示词

```markdown
# TDD 测试编写提示词模板

【任务】为 MenuStore 编写单元测试

【测试文件】tests/stores/menu.spec.ts

【测试框架】Vitest + Vue Test Utils + happy-dom

【Store 功能说明】
MenuStore 负责管理左侧导航菜单:
- 从 API 获取菜单数据
- 构建树形结构
- 查找菜单项
- 根据类型生成路由路径

【测试场景】

**1. 菜单数据获取**
```typescript
describe('fetchMenuItems', () => {
  it('should fetch menu items from API', async () => {
    // Mock API 返回菜单数据
    // 调用 store.fetchMenuItems()
    // 断言 store.menuItems 被填充
  })

  it('should handle API error', async () => {
    // Mock API 返回错误
    // 调用 store.fetchMenuItems()
    // 断言显示错误消息
  })
})
```

**2. 树形结构构建**
```typescript
describe('buildMenuTree', () => {
  it('should build tree from flat menu items', () => {
    // 输入扁平菜单数组:
    const flatItems = [
      { id: '1', label: '首页', parentId: null },
      { id: '2', label: '产品', parentId: null },
      { id: '3', label: '水培设备', parentId: '2' },
      { id: '4', label: '营养液', parentId: '2' }
    ]

    // 期望输出:
    const expected = [
      { id: '1', label: '首页', children: [] },
      {
        id: '2',
        label: '产品',
        children: [
          { id: '3', label: '水培设备', children: [] },
          { id: '4', label: '营养液', children: [] }
        ]
      }
    ]

    // 调用 store.buildMenuTree(flatItems)
    // 断言结果等于 expected
  })

  it('should handle empty input', () => {
    // 输入空数组
    // 返回空数组
  })

  it('should handle orphaned items', () => {
    // 输入包含孤儿节点的数组 (parentId 不存在)
    // 孤儿节点应该作为根节点
  })
})
```

**3. 菜单项查找**
```typescript
describe('findMenuItemById', () => {
  it('should find root level item', () => {
    // 设置菜单树
    // 查找根节点
    // 断言找到正确项
  })

  it('should find nested item', () => {
    // 设置菜单树
    // 查找子节点
    // 断言找到正确项
  })

  it('should return null if not found', () => {
    // 查找不存在的 ID
    // 返回 null
  })
})
```

**4. 路由路径生成**
```typescript
describe('getRoutePathByType', () => {
  it('should return page editor path for PAGE type', () => {
    const item = { id: '1', type: 'PAGE', menuItemId: 'menu-1' }
    const path = store.getRoutePathByType(item)
    expect(path).toBe('/pages/menu-1/edit')
  })

  it('should return post list path for POST_LIST type', () => {
    const item = { id: '2', type: 'POST_LIST', menuItemId: 'menu-2' }
    const path = store.getRoutePathByType(item)
    expect(path).toBe('/posts?menuItemId=menu-2')
  })

  it('should return product list path for PRODUCT type', () => {
    const item = { id: '3', type: 'PRODUCT', menuItemId: 'menu-3' }
    const path = store.getRoutePathByType(item)
    expect(path).toBe('/products?menuItemId=menu-3')
  })
})
```

**5. 展开/折叠状态**
```typescript
describe('expandedKeys', () => {
  it('should persist expanded state', () => {
    // 展开某些节点
    // 刷新页面
    // 从 localStorage 恢复状态
    // 断言节点仍然展开
  })
})
```

【Mock 设置】
```typescript
// tests/utils/test-utils.ts
import { vi } from 'vitest'

export const mockMenuApi = {
  getMenuList: vi.fn().mockResolvedValue({
    success: true,
    data: [
      { id: '1', label: '首页', type: 'PAGE', parentId: null },
      { id: '2', label: '产品', type: 'PRODUCT', parentId: null }
    ]
  })
}
```

【预期测试数量】至少 11 个测试用例

【要求】
1. 每个测试都有清晰的描述
2. 使用 describe 分组
3. Mock 所有外部依赖
4. 断言使用 expect(...).toBe/toEqual/toHaveBeenCalled
5. 异步测试使用 async/await

【禁止】
- 不要在这一步实现 Store 代码
- 只编写测试,所有测试应该失败 (红色)

完成后告诉我:"MenuStore 测试编写完成,11 个测试待通过"
```

### 3. 复杂组件开发提示词

```markdown
# 复杂组件开发提示词 (区块编辑器)

【任务】实现页面编辑器 (PageEditor)

【复杂度】⭐⭐⭐⭐⭐ (最高)

【参考文档】
- CMS-PRD-v1.0.md 第 4.2 节
- admin/ADMIN_IMPLEMENTATION_PLAN.md 阶段 6

【功能概述】
PageEditor 是一个可视化区块编辑器,允许用户:
1. 添加/删除区块
2. 拖拽排序区块
3. 配置每个区块的属性
4. 预览页面效果
5. 保存/发布页面

【组件架构】
```
PageEditor.vue (主组件)
├── BasicInfoSection (页面基本信息)
│   ├── 标题输入
│   ├── Slug 输入
│   └── 所属栏目选择
├── BlockList (区块列表)
│   ├── VueDraggable (拖拽排序)
│   └── BlockItem (单个区块)
│       ├── 区块类型图标
│       ├── 区块标题
│       └── 操作按钮 (编辑/删除)
├── BlockSelector (区块选择器 - 抽屉)
│   └── 12 种区块类型网格
└── BlockConfigPanel (区块配置面板 - 抽屉)
    ├── HeroBlockConfig.vue
    ├── TextBlockConfig.vue
    ├── ImageGalleryBlockConfig.vue
    └── ... (9 种其他配置组件)
```

【分步实现】

**Step 1: 区块类型定义**
创建 `src/config/blocks.ts`:

```typescript
export interface BlockType {
  type: string
  label: string
  icon: string
  category: 'content' | 'media' | 'interactive'
  defaultProps: Record<string, any>
}

export const BLOCK_TYPES: BlockType[] = [
  {
    type: 'hero',
    label: 'Hero 横幅',
    icon: 'image-outline',
    category: 'content',
    defaultProps: {
      title: '欢迎来到我们的网站',
      subtitle: '专业的解决方案提供商',
      backgroundImage: '',
      ctaText: '了解更多',
      ctaLink: '',
      overlayOpacity: 0.5
    }
  },
  {
    type: 'text',
    label: '文本内容',
    icon: 'document-text-outline',
    category: 'content',
    defaultProps: {
      content: '<p>在此输入文本内容...</p>',
      textAlign: 'left',
      maxWidth: '800px'
    }
  },
  {
    type: 'image-gallery',
    label: '图片画廊',
    icon: 'images-outline',
    category: 'media',
    defaultProps: {
      images: [],
      columns: 3,
      gap: 16,
      lightbox: true
    }
  },
  {
    type: 'features',
    label: '特性列表',
    icon: 'list-outline',
    category: 'content',
    defaultProps: {
      title: '我们的优势',
      items: [
        { icon: 'checkmark-circle', title: '高质量', description: '专业团队保障' },
        { icon: 'flash', title: '快速响应', description: '24小时客服' },
        { icon: 'shield-checkmark', title: '安全可靠', description: '数据加密保护' }
      ],
      columns: 3
    }
  },
  {
    type: 'cta',
    label: 'CTA 行动号召',
    icon: 'megaphone-outline',
    category: 'interactive',
    defaultProps: {
      title: '准备好开始了吗?',
      description: '立即联系我们,获取专业解决方案',
      buttonText: '立即咨询',
      buttonLink: '/contact',
      backgroundColor: '#1890ff',
      textColor: '#ffffff'
    }
  },
  {
    type: 'faq',
    label: 'FAQ 常见问题',
    icon: 'help-circle-outline',
    category: 'content',
    defaultProps: {
      title: '常见问题',
      items: [
        { question: '如何开始使用?', answer: '注册账号后即可开始...' },
        { question: '价格是多少?', answer: '我们提供多种套餐...' }
      ]
    }
  },
  {
    type: 'product-showcase',
    label: '产品展示',
    icon: 'cube-outline',
    category: 'content',
    defaultProps: {
      productIds: [],
      layout: 'grid',
      columns: 3,
      showPrice: true,
      showDescription: true
    }
  },
  {
    type: 'testimonials',
    label: '客户评价',
    icon: 'chatbox-ellipses-outline',
    category: 'content',
    defaultProps: {
      title: '客户怎么说',
      items: [
        {
          content: '非常专业的服务!',
          author: '张三',
          company: 'ABC 公司',
          avatar: ''
        }
      ],
      layout: 'carousel'
    }
  },
  {
    type: 'contact-form',
    label: '联系表单',
    icon: 'mail-outline',
    category: 'interactive',
    defaultProps: {
      title: '联系我们',
      formCode: 'contact',
      fields: ['name', 'email', 'phone', 'message'],
      submitButtonText: '提交'
    }
  },
  {
    type: 'map',
    label: '地图',
    icon: 'location-outline',
    category: 'media',
    defaultProps: {
      latitude: 39.9042,
      longitude: 116.4074,
      zoom: 15,
      marker: true,
      address: '北京市朝阳区'
    }
  },
  {
    type: 'video',
    label: '视频',
    icon: 'videocam-outline',
    category: 'media',
    defaultProps: {
      videoUrl: '',
      poster: '',
      autoplay: false,
      loop: false,
      controls: true
    }
  },
  {
    type: 'divider',
    label: '分隔线',
    icon: 'remove-outline',
    category: 'content',
    defaultProps: {
      style: 'solid',
      color: '#e0e0e0',
      thickness: 1,
      spacing: 32
    }
  }
]

export function getBlockTypeConfig(type: string): BlockType | undefined {
  return BLOCK_TYPES.find(b => b.type === type)
}
```

**Step 2: 区块配置组件**
为每种区块创建配置组件,例如 `HeroBlockConfig.vue`:

```vue
<template>
  <n-space vertical :size="16">
    <n-form-item label="标题">
      <n-input v-model:value="props.title" placeholder="输入Hero标题" />
    </n-form-item>

    <n-form-item label="副标题">
      <n-input v-model:value="props.subtitle" placeholder="输入副标题" />
    </n-form-item>

    <n-form-item label="背景图片">
      <MediaSelector
        v-model:value="props.backgroundImage"
        accept="image/*"
      />
    </n-form-item>

    <n-form-item label="按钮文字">
      <n-input v-model:value="props.ctaText" />
    </n-form-item>

    <n-form-item label="按钮链接">
      <n-input v-model:value="props.ctaLink" placeholder="/about" />
    </n-form-item>

    <n-form-item label="遮罩透明度">
      <n-slider v-model:value="props.overlayOpacity" :min="0" :max="1" :step="0.1" />
      <span>{{ props.overlayOpacity }}</span>
    </n-form-item>
  </n-space>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import MediaSelector from '@/components/media/MediaSelector.vue'

const props = defineProps<{
  title: string
  subtitle: string
  backgroundImage: string
  ctaText: string
  ctaLink: string
  overlayOpacity: number
}>()
</script>
```

**Step 3: PageEditor 主组件**
创建 `views/pages/PageEditor.vue`:

```vue
<template>
  <div class="page-editor">
    <!-- Header -->
    <n-page-header @back="handleBack">
      <template #title>
        {{ isEditMode ? '编辑页面' : '新建页面' }}
      </template>
      <template #extra>
        <n-space>
          <n-button @click="handleSave" :loading="saving">保存</n-button>
          <n-button
            v-if="isEditMode"
            type="primary"
            @click="handlePublish"
            :loading="publishing"
          >
            {{ pageData.status === 'PUBLISHED' ? '取消发布' : '发布' }}
          </n-button>
        </n-space>
      </template>
    </n-page-header>

    <n-layout class="editor-layout">
      <!-- Left: Block List -->
      <n-layout-sider width="300" bordered>
        <div class="block-list-header">
          <h3>页面区块</h3>
          <n-button size="small" @click="showBlockSelector = true">
            <template #icon>
              <n-icon><AddIcon /></n-icon>
            </template>
            添加区块
          </n-button>
        </div>

        <draggable
          v-model="pageData.blocks"
          item-key="id"
          handle=".drag-handle"
          @end="handleBlockReorder"
        >
          <template #item="{ element, index }">
            <div class="block-item" :class="{ active: currentBlockIndex === index }">
              <div class="drag-handle">
                <n-icon><MenuIcon /></n-icon>
              </div>
              <div class="block-info">
                <n-icon><component :is="getBlockIcon(element.type)" /></n-icon>
                <span>{{ getBlockLabel(element.type) }}</span>
              </div>
              <div class="block-actions">
                <n-button size="tiny" text @click="editBlock(index)">
                  <template #icon><n-icon><EditIcon /></n-icon></template>
                </n-button>
                <n-button size="tiny" text @click="deleteBlock(index)">
                  <template #icon><n-icon><DeleteIcon /></n-icon></template>
                </n-button>
              </div>
            </div>
          </template>
        </draggable>
      </n-layout-sider>

      <!-- Center: Preview (Optional) -->
      <n-layout-content class="editor-content">
        <n-card title="页面基本信息">
          <n-form ref="formRef" :model="pageData" :rules="rules">
            <n-form-item label="页面标题" path="title">
              <n-input v-model:value="pageData.title" placeholder="输入页面标题" />
            </n-form-item>

            <n-form-item label="URL Slug" path="slug">
              <n-input v-model:value="pageData.slug" placeholder="about-us" />
            </n-form-item>

            <n-form-item label="所属栏目" path="menuItemId">
              <n-select
                v-model:value="pageData.menuItemId"
                :options="menuOptions"
                placeholder="选择栏目"
              />
            </n-form-item>
          </n-form>
        </n-card>

        <!-- Block Preview (Optional - can add later) -->
        <n-card title="区块预览" class="mt-4">
          <n-empty v-if="pageData.blocks.length === 0" description="暂无区块,点击左上角添加区块" />
          <div v-else class="block-preview">
            <!-- Render blocks (simplified) -->
            <div v-for="(block, index) in pageData.blocks" :key="block.id" class="preview-block">
              <strong>{{ getBlockLabel(block.type) }}</strong>
            </div>
          </div>
        </n-card>
      </n-layout-content>
    </n-layout>

    <!-- Block Selector Drawer -->
    <n-drawer v-model:show="showBlockSelector" width="600" placement="right">
      <n-drawer-content title="选择区块类型">
        <n-grid cols="2" :x-gap="16" :y-gap="16">
          <n-grid-item v-for="blockType in BLOCK_TYPES" :key="blockType.type">
            <n-card hoverable @click="addBlock(blockType.type)">
              <div class="block-type-card">
                <n-icon size="32"><component :is="blockType.icon" /></n-icon>
                <strong>{{ blockType.label }}</strong>
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-drawer-content>
    </n-drawer>

    <!-- Block Config Drawer -->
    <n-drawer v-model:show="showBlockConfig" width="600" placement="right">
      <n-drawer-content :title="`配置 ${currentBlockLabel}`">
        <component
          v-if="currentBlock"
          :is="getBlockConfigComponent(currentBlock.type)"
          v-bind="currentBlock.props"
          @update="updateBlockProps"
        />
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import draggable from 'vuedraggable'
import { BLOCK_TYPES, getBlockTypeConfig } from '@/config/blocks'
import { getPageDetail, createPage, updatePage, publishPage } from '@/api/page'

// ... 组件逻辑
const route = useRoute()
const router = useRouter()
const message = useMessage()

const isEditMode = computed(() => !!route.params.id)
const pageData = ref({
  title: '',
  slug: '',
  menuItemId: '',
  blocks: [],
  status: 'DRAFT'
})

const saving = ref(false)
const publishing = ref(false)
const showBlockSelector = ref(false)
const showBlockConfig = ref(false)
const currentBlockIndex = ref<number | null>(null)

const currentBlock = computed(() => {
  if (currentBlockIndex.value === null) return null
  return pageData.value.blocks[currentBlockIndex.value]
})

function addBlock(type: string) {
  const config = getBlockTypeConfig(type)
  if (!config) return

  const newBlock = {
    id: `block-${Date.now()}`,
    type: config.type,
    props: { ...config.defaultProps },
    order: pageData.value.blocks.length,
    visibility: true
  }

  pageData.value.blocks.push(newBlock)
  showBlockSelector.value = false
  message.success(`已添加 ${config.label}`)
}

function editBlock(index: number) {
  currentBlockIndex.value = index
  showBlockConfig.value = true
}

function deleteBlock(index: number) {
  pageData.value.blocks.splice(index, 1)
  message.success('区块已删除')
}

function updateBlockProps(newProps: Record<string, any>) {
  if (currentBlockIndex.value === null) return
  pageData.value.blocks[currentBlockIndex.value].props = { ...newProps }
}

async function handleSave() {
  try {
    saving.value = true
    if (isEditMode.value) {
      await updatePage(route.params.id as string, pageData.value)
      message.success('保存成功')
    } else {
      const result = await createPage(pageData.value)
      message.success('创建成功')
      router.push(`/pages/${result.data.id}/edit`)
    }
  } catch (error: any) {
    message.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function handlePublish() {
  try {
    publishing.value = true
    const action = pageData.value.status === 'PUBLISHED' ? 'unpublish' : 'publish'
    await publishPage(route.params.id as string, action)
    pageData.value.status = action === 'publish' ? 'PUBLISHED' : 'DRAFT'
    message.success(action === 'publish' ? '发布成功' : '已取消发布')
  } catch (error: any) {
    message.error(error.message || '操作失败')
  } finally {
    publishing.value = false
  }
}

onMounted(async () => {
  if (isEditMode.value) {
    const response = await getPageDetail(route.params.id as string)
    pageData.value = response.data
  }
})
</script>

<style scoped>
.page-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-layout {
  flex: 1;
  overflow: hidden;
}

.block-list-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.block-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.block-item:hover,
.block-item.active {
  background: #f5f5f5;
}

.drag-handle {
  cursor: move;
  margin-right: 8px;
}

.block-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor-content {
  padding: 24px;
  overflow-y: auto;
}
</style>
```

**Step 4: 测试编写**
创建 `tests/views/pages/PageEditor.spec.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PageEditor from '@/views/pages/PageEditor.vue'
import { BLOCK_TYPES } from '@/config/blocks'

describe('PageEditor', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders create mode correctly', () => {
    const wrapper = mount(PageEditor, {
      global: {
        plugins: [createPinia()],
        mocks: {
          $route: { params: {} }
        }
      }
    })

    expect(wrapper.find('.page-editor').exists()).toBe(true)
    expect(wrapper.text()).toContain('新建页面')
  })

  it('adds a new block', async () => {
    const wrapper = mount(PageEditor)

    await wrapper.vm.addBlock('hero')

    expect(wrapper.vm.pageData.blocks.length).toBe(1)
    expect(wrapper.vm.pageData.blocks[0].type).toBe('hero')
  })

  it('deletes a block', async () => {
    const wrapper = mount(PageEditor)

    wrapper.vm.pageData.blocks = [
      { id: '1', type: 'hero', props: {}, order: 0, visibility: true }
    ]

    await wrapper.vm.deleteBlock(0)

    expect(wrapper.vm.pageData.blocks.length).toBe(0)
  })

  // ... 至少 15 个测试
})
```

【预估时间】
- 区块类型定义: 30 分钟
- 12 个区块配置组件: 4 小时
- PageEditor 主组件: 3 小时
- 测试编写: 2 小时
- **总计: 约 3 天**

【交付清单】
- [ ] src/config/blocks.ts (区块类型定义)
- [ ] 12 个区块配置组件
- [ ] views/pages/PageEditor.vue (主组件)
- [ ] tests/views/pages/PageEditor.spec.ts (15+ tests)
- [ ] 更新路由配置

【开发策略】
请按照 Step 1 → Step 2 → Step 3 → Step 4 顺序开发。
每完成一步,告诉我进度,等待我确认后再继续下一步。

现在请开始 Step 1: 创建 blocks.ts 配置文件。
```

### 4. Bug 修复提示词

```markdown
# Bug 修复提示词模板

【Bug 报告】文章列表分类列显示 "-"

【严重程度】P0 (完全阻塞功能)

【影响范围】PostList 组件,所有用户

【现象描述】
在文章列表页 (http://localhost:5173/posts),所有文章的"分类"列都显示 "-",
即使数据库中存在分类关联数据。

【复现步骤】
1. 登录管理后台
2. 导航到"文章管理"
3. 观察表格的"分类"列
4. 结果: 所有行显示 "-"

【预期行为】
应该显示文章所属的分类名称,如"新手入门"、"进阶技巧"。
如果文章有多个分类,应显示逗号分隔的列表。

【调试信息】

**1. 前端代码 (PostList.vue line 158-160)**
```vue
<template #categoryIds="{ row }">
  <span>{{ row.categoryIds?.length > 0 ? '有分类' : '-' }}</span>
</template>
```

**2. API 响应 (GET /posts)**
使用浏览器 DevTools 查看 Network 面板:
```json
{
  "data": [
    {
      "id": "clxxxxxx",
      "title": "什么是水培?",
      "slug": "what-is-hydroponics",
      "status": "PUBLISHED",
      "menuItemId": "menu-blog",
      "authorId": "user-1",
      "createdAt": "2025-10-20T10:00:00.000Z",
      "updatedAt": "2025-10-20T10:00:00.000Z",

      // ❌ 问题: 缺少 categoryIds 字段
      // 期望: categoryIds: ["cat-1", "cat-2"]
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

**3. 数据库数据 (Prisma Studio)**
查看 PostCategory 关系表:
```
id   | postId        | categoryId
-----|---------------|-------------
1    | clxxxxxx      | cat-1
2    | clxxxxxx      | cat-2
```
确认数据库中存在关联记录。

**4. 后端代码 (api/src/post/post.service.ts)**
查看 findAll 方法 (line 100-130):
```typescript
async findAll(query: PostQueryDto) {
  const { page = 1, limit = 20, keyword, status } = query

  const where: any = {}
  if (keyword) {
    where.OR = [
      { title: { contains: keyword } },
      { summary: { contains: keyword } }
    ]
  }
  if (status) where.status = status

  const [posts, total] = await Promise.all([
    this.prisma.post.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
      // ❌ 问题: 缺少 include 关联查询
    }),
    this.prisma.post.count({ where })
  ])

  return { data: posts, total, page, limit }
}
```

【问题分析】
1. **根本原因**: API 的 `findAll` 方法未包含 Prisma 的关联查询
2. **缺少字段**: 需要 include `postCategories` 关系
3. **数据转换**: 需要从嵌套的 postCategories 提取 categoryIds 数组

【修复方案】

**Step 1: 修改 Prisma 查询**
在 `api/src/post/post.service.ts` 的 findMany 中添加 include:

```typescript
const [posts, total] = await Promise.all([
  this.prisma.post.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { id: true, displayName: true, email: true }
      },
      postCategories: {
        include: { category: true }
      },
      postTags: {
        include: { tag: true }
      }
    }
  }),
  this.prisma.post.count({ where })
])
```

**Step 2: 转换数据格式**
在返回前提取 categoryIds 和 tagIds:

```typescript
const data = posts.map((post: any) => ({
  ...post,
  categoryIds: post.postCategories?.map((pc: any) => pc.categoryId) || [],
  tagIds: post.postTags?.map((pt: any) => pt.tagId) || [],
  authorName: post.author?.displayName || 'Unknown',
  // 可选: 移除嵌套的中间表
  postCategories: undefined,
  postTags: undefined
}))

return { data, total, page, limit }
```

**Step 3: 更新前端渲染**
确保 PostList.vue 正确显示分类:

```vue
<template #categoryIds="{ row }">
  <n-space v-if="row.categoryIds && row.categoryIds.length > 0">
    <n-tag
      v-for="catId in row.categoryIds"
      :key="catId"
      size="small"
      type="info"
    >
      {{ getCategoryName(catId) }}
    </n-tag>
  </n-space>
  <span v-else>-</span>
</template>

<script setup>
const getCategoryName = (catId: string) => {
  const category = categories.value.find(c => c.id === catId)
  return category?.name || catId
}
</script>
```

【验证步骤】
1. 修改 `api/src/post/post.service.ts`
2. 重启 NestJS 服务: `npm run start:dev`
3. 刷新 PostList 页面
4. 确认"分类"列显示分类名称
5. 检查 5 篇文章的分类是否正确:
   - "什么是水培?" → "新手入门"
   - "家庭水培系统DIY" → "家庭水培", "新手入门"
   - "营养液配方大全" → "进阶技巧"
   - "2025年水培行业发展趋势" → "行业资讯"
   - "水培草莓种植全攻略" → "进阶技巧"

【回归测试】
修复后请确认以下功能未受影响:
- [ ] 文章列表分页正常
- [ ] 搜索功能正常
- [ ] 状态筛选正常
- [ ] 编辑/删除按钮正常
- [ ] PostEditor 加载文章时 categoryIds 正确

【预期修复时间】30-40 分钟

【交付】
- 修改后的 post.service.ts
- 验证截图 (显示正确的分类)
- 回归测试报告

请按照 Step 1 → Step 2 → Step 3 → 验证步骤 的顺序进行修复。
```

---

## 最佳实践总结

### 1. 文档驱动开发

#### 为什么文档重要?

在使用 AI 辅助开发时,**文档比代码更重要**。原因:

1. **上下文持久化**: AI 的记忆是短期的,文档提供长期上下文
2. **需求明确化**: 文档逼迫你思考清楚要做什么
3. **防止偏离**: AI 容易"发挥",文档是锚点
4. **团队协作**: 文档让其他开发者快速理解项目

#### 推荐的文档结构

```
项目文档/
├── README.md              # 项目概览和快速开始
├── CLAUDE.md              # AI 助手配置文件
├── CMS-PRD-v1.0.md        # 产品需求文档
├── CMS-v1.0-Execution-Plan.md  # 实施计划
├── ADMIN_IMPLEMENTATION_PLAN.md  # 管理后台实现计划
├── API-DESIGN.md          # API 接口设计
├── DATABASE-SCHEMA.md     # 数据库设计
├── ARCHITECTURE.md        # 架构设计文档
├── TDD-STRATEGY.md        # 测试策略
├── DEPLOYMENT.md          # 部署指南
└── progress/              # 开发进度文档
    ├── WEEK-1-SUMMARY.md
    ├── WEEK-2-SUMMARY.md
    └── BUG-FIXES.md
```

#### 文档编写技巧

**1. PRD (Product Requirements Document)**
- 功能清单 (优先级标记)
- 用户角色和权限
- 业务流程图
- 数据库模型
- 非功能性需求

**2. 实施计划**
- 阶段划分
- 依赖关系
- 时间估算
- 里程碑定义

**3. 开发进度**
- 每日/每周总结
- 完成的功能
- 遇到的问题
- 技术决策记录

### 2. TDD 防止 AI "幻觉"

#### 什么是 AI "幻觉"?

AI 有时会:
- 编造不存在的 API
- 使用错误的语法
- 偏离原始需求
- 过度设计

#### TDD 如何解决?

**测试即规格说明**
```typescript
// 这个测试就是需求的精确表达
it('should return categoryIds array', async () => {
  const response = await api.get('/posts')

  expect(response.data[0]).toHaveProperty('categoryIds')
  expect(Array.isArray(response.data[0].categoryIds)).toBe(true)
  expect(response.data[0].categoryIds).toEqual(['cat-1', 'cat-2'])
})
```

当测试明确定义了输入输出,AI 就没有"发挥"的空间。

#### TDD 工作流程

```
1. 编写测试 (描述期望行为)
   ↓
2. 运行测试 (应该失败,红色)
   ↓
3. 实现功能 (让测试通过)
   ↓
4. 运行测试 (应该通过,绿色)
   ↓
5. 重构代码 (保持测试通过)
   ↓
6. 提交代码
```

#### TDD 提示词模式

```
【强制 TDD 模式】

【第一步: 只写测试】
创建 tests/xxx.spec.ts,编写以下测试:
1. 测试场景 A
2. 测试场景 B
3. 测试场景 C

【要求】
- 不要实现功能代码
- 所有测试应该失败 (红色)
- 使用 Mock 隔离外部依赖

完成后停止,等待我确认。

---

【第二步: 实现功能】
(仅在第一步完成后)

现在实现功能代码,使所有测试通过。

【禁止】
- 不要修改测试代码
- 不要添加测试中未定义的功能
```

### 3. 分阶段推进复杂项目

#### 阶段划分原则

1. **从简单到复杂**: 先实现基础功能,再添加高级功能
2. **从核心到边缘**: 先实现核心流程,再完善辅助功能
3. **从后端到前端**: API 稳定后再开发前端
4. **从功能到优化**: 先跑通流程,再优化性能

#### Docms 的阶段划分

```
阶段 0: 规划和文档 (2 天)
├── PRD 编写
├── 技术选型
└── 实施计划

阶段 1: 项目基建 (2 天)
├── 项目初始化
├── 配置文件
└── 开发环境

阶段 2: 认证和布局 (3 天)
├── 登录/登出
├── JWT 管理
├── 主布局
└── 路由守卫

阶段 3: 动态导航 (1.5 天)
├── 菜单数据模型
├── 菜单 API
└── 侧边栏组件

阶段 4: 核心模块 (10 天)
├── 菜单管理 (3 天)
├── 媒体库 (4 天)
├── 页面管理 (3 天)
├── 文章管理 (3 天)
├── 产品管理 (0.5 天)
└── 用户管理 (1 天)

阶段 5: 完善和优化 (2 天)
├── Bug 修复
├── 性能优化
└── 用户体验提升
```

#### 每个阶段的标准流程

```
1. 编写阶段计划文档
2. 分解为小任务 (每个任务 2-4 小时)
3. 按照 TDD 模式实现每个任务
4. 编写阶段总结文档
5. 进行功能测试
6. Git 提交 (清晰的 commit message)
7. 进入下一阶段
```

### 4. 模块化和复用

#### 识别可复用组件

在 Docms 项目中,识别出以下可复用组件:

1. **MediaSelector**: 被 PostEditor、ProductEditor、所有区块配置复用
2. **CategoryManager**: 独立组件,可嵌入任何需要分类的地方
3. **TagManager**: 独立组件,可嵌入任何需要标签的地方
4. **RichTextEditor**: 封装 Quill,统一配置
5. **PageHeader**: 统一的页面顶部布局
6. **DataTable**: 统一的表格配置

#### 复用提示词模式

```
【任务】实现 ProductEditor 的封面图片上传

【复用现有组件】
我已经实现了 MediaSelector 组件:
- 文件: admin/src/components/media/MediaSelector.vue
- 功能: 单选/多选、文件上传、媒体库选择
- Props: value (v-model), multiple, accept
- Events: update:value

【使用方法】
在 ProductEditor 中:
```vue
<template>
  <n-form-item label="封面图片">
    <MediaSelector
      v-model:value="formData.coverImageId"
      :multiple="false"
      accept="image/*"
    />
  </n-form-item>
</template>

<script setup>
import MediaSelector from '@/components/media/MediaSelector.vue'
</script>
```

【禁止】
- 不要重新实现上传逻辑
- 不要复制代码
- 直接复用 MediaSelector 组件

请在 ProductEditor 中集成 MediaSelector。
```

### 5. 错误处理和边界情况

#### 常见边界情况

在开发每个功能时,考虑以下边界情况:

1. **空状态**: 没有数据时如何显示?
2. **加载状态**: 数据加载中如何提示?
3. **错误状态**: API 失败如何提示?
4. **权限不足**: 用户无权操作如何处理?
5. **网络离线**: 断网如何提示?
6. **表单验证**: 输入不合法如何提示?
7. **并发操作**: 同时多个操作如何处理?

#### 边界情况提示词

```
【任务】实现 ProductList,确保处理所有边界情况

【必须处理的场景】

1. 空状态
   - 无产品时显示空状态插图
   - 提示"暂无产品,点击新建按钮创建第一个产品"
   - 显示新建按钮

2. 加载状态
   - 初始加载显示骨架屏或 loading
   - 分页切换显示 loading
   - 删除操作显示 loading

3. 错误状态
   - API 失败显示错误消息
   - 提供重试按钮
   - 记录错误到控制台

4. 删除确认
   - 显示确认对话框
   - 说明删除后无法恢复
   - 提供取消按钮

5. 权限处理
   - 非管理员隐藏删除按钮
   - 操作失败显示"权限不足"

6. 数据异常
   - 图片加载失败显示占位图
   - 日期无效显示"-"
   - 数组为空显示"-"

【实现要求】
对每种情况编写测试用例,确保 UI 正确响应。
```

### 6. 性能优化

#### 前端性能优化

**1. 路由懒加载**
```typescript
const routes = [
  {
    path: '/posts',
    component: () => import('@/views/posts/PostList.vue')  // 懒加载
  }
]
```

**2. 组件按需引入**
```typescript
// 不要全局引入 Naive UI
import { NButton, NInput } from 'naive-ui'
```

**3. 列表虚拟滚动**
```vue
<n-virtual-list
  :items="longList"
  :item-size="50"
  :item-resizable="true"
>
  <template #default="{ item }">
    <ListItem :item="item" />
  </template>
</n-virtual-list>
```

**4. 图片懒加载**
```vue
<img v-lazy="imageUrl" />
```

#### 后端性能优化

**1. 数据库查询优化**
```typescript
// 使用 select 减少返回字段
this.prisma.post.findMany({
  select: {
    id: true,
    title: true,
    status: true,
    // 只选择需要的字段
  }
})

// 使用索引
@@index([slug])
@@index([status, createdAt])
```

**2. 分页**
```typescript
// 始终使用分页
async findAll(query: { page: number, limit: number }) {
  const skip = (query.page - 1) * query.limit
  return this.prisma.post.findMany({
    skip,
    take: query.limit
  })
}
```

**3. 缓存**
```typescript
// 使用 Redis 缓存热点数据
@Cacheable('menu-tree', 60) // 缓存 60 秒
async getMenuTree() {
  // ...
}
```

### 7. Git 提交策略

#### Commit Message 规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型:**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式 (不影响功能)
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例:**
```
feat(post): implement PostEditor with rich text editor

- Add Quill rich text editor
- Implement category and tag selection
- Add cover image upload
- Add SEO settings tab
- Write 13 test cases

Closes #23
```

#### 提交频率

- **小步提交**: 每完成一个小功能就提交
- **测试通过再提交**: 确保测试全部通过
- **独立提交**: 每个 commit 只做一件事

#### 分支策略

```
main (主分支)
├── develop (开发分支)
    ├── feature/post-editor (功能分支)
    ├── feature/product-management (功能分支)
    └── fix/post-category-display (修复分支)
```

---

## 注意事项和常见陷阱

### 1. 不要过度依赖 AI

#### AI 的局限性

- **无法理解业务**: AI 不懂你的具体业务需求
- **缺乏架构思维**: AI 难以做出宏观架构决策
- **容易过度设计**: AI 倾向于添加不必要的功能
- **测试覆盖不足**: AI 编写的测试往往不够全面

#### 人类的作用

1. **需求分析**: 你需要理解业务,编写清晰的需求文档
2. **架构设计**: 你需要设计系统架构,不能让 AI 随意发挥
3. **代码审查**: 你需要审查 AI 生成的代码,确保质量
4. **测试策略**: 你需要设计测试策略,AI 只是执行

### 2. 前后端数据格式要统一

#### 常见问题

**枚举值大小写**
```typescript
// 后端 (Prisma Schema)
enum PostStatus {
  DRAFT       // 大写
  PUBLISHED   // 大写
}

// 前端 (TypeScript)
type PostStatus = 'draft' | 'published'  // 小写

// ❌ 不匹配,导致状态判断错误
```

**解决方案:**
```typescript
// 方案 1: 统一使用大写
type PostStatus = 'DRAFT' | 'PUBLISHED'

// 方案 2: 前端转换
const status = row.status?.toUpperCase()
```

#### API 响应格式统一

```typescript
// 定义统一的响应格式
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface ListResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
```

### 3. 测试不是可选的

#### 为什么必须写测试?

1. **防止回归**: 新功能不会破坏旧功能
2. **文档作用**: 测试是最好的使用示例
3. **重构信心**: 有测试才敢重构
4. **团队协作**: 测试保证接口契约

#### 测试覆盖率目标

- **Store 层**: > 90%
- **组件层**: > 80%
- **API 层**: 100%

#### 不要只写"快乐路径"

```typescript
// ❌ 只测试成功情况
it('should create post', async () => {
  const result = await createPost(validData)
  expect(result.success).toBe(true)
})

// ✅ 也要测试失败情况
it('should fail when title is empty', async () => {
  await expect(createPost({ title: '' })).rejects.toThrow()
})

it('should fail when API returns 500', async () => {
  mockApi.createPost.mockRejectedValue(new Error('Server error'))
  await expect(createPost(validData)).rejects.toThrow()
})
```

### 4. 不要忽略性能

#### 常见性能问题

**1. N+1 查询**
```typescript
// ❌ 错误: 每个 post 都查一次 author
const posts = await prisma.post.findMany()
for (const post of posts) {
  post.author = await prisma.user.findUnique({ where: { id: post.authorId } })
}

// ✅ 正确: 使用 include 一次查询
const posts = await prisma.post.findMany({
  include: { author: true }
})
```

**2. 返回过多字段**
```typescript
// ❌ 错误: 返回所有字段 (包括 passwordHash)
const users = await prisma.user.findMany()

// ✅ 正确: 只返回需要的字段
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    displayName: true
    // 不返回 passwordHash
  }
})
```

**3. 缺少分页**
```typescript
// ❌ 错误: 一次返回所有数据
const posts = await prisma.post.findMany()

// ✅ 正确: 始终使用分页
const posts = await prisma.post.findMany({
  skip: (page - 1) * limit,
  take: limit
})
```

### 5. 安全性不可忽视

#### 常见安全问题

**1. 密码存储**
```typescript
// ❌ 错误: 明文存储密码
user.password = password

// ✅ 正确: 使用 bcrypt 哈希
import * as bcrypt from 'bcrypt'
user.passwordHash = await bcrypt.hash(password, 10)
```

**2. JWT Token**
```typescript
// ✅ 使用强密钥
JWT_SECRET=一个超长随机字符串至少32位

// ✅ 设置过期时间
expiresIn: '15m'  // Access Token 15 分钟
expiresIn: '7d'   // Refresh Token 7 天
```

**3. 文件上传**
```typescript
// ✅ 验证文件类型
const allowedMimes = ['image/jpeg', 'image/png', 'image/webp']
if (!allowedMimes.includes(file.mimetype)) {
  throw new Error('不支持的文件类型')
}

// ✅ 限制文件大小
if (file.size > 5 * 1024 * 1024) {  // 5MB
  throw new Error('文件过大')
}
```

**4. SQL 注入 (Prisma 自动防护)**
```typescript
// ✅ Prisma 自动参数化查询,防止 SQL 注入
const user = await prisma.user.findUnique({
  where: { email: userInput }  // 安全
})
```

### 6. 用户体验细节

#### 加载状态

```vue
<template>
  <n-button @click="handleSave" :loading="saving">
    保存
  </n-button>
</template>

<script setup>
const saving = ref(false)

async function handleSave() {
  saving.value = true
  try {
    await api.save()
    message.success('保存成功')
  } finally {
    saving.value = false  // 确保恢复
  }
}
</script>
```

#### 空状态

```vue
<template>
  <n-empty v-if="products.length === 0" description="暂无产品">
    <template #extra>
      <n-button @click="goToCreate">新建产品</n-button>
    </template>
  </n-empty>
</template>
```

#### 确认对话框

```vue
<script setup>
function handleDelete(id: string) {
  dialog.warning({
    title: '确认删除',
    content: '删除后将无法恢复,确定要删除这个产品吗?',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await api.delete(id)
      message.success('删除成功')
      refresh()
    }
  })
}
</script>
```

---

## 成果展示

### 项目统计

#### 代码量
- **前端代码**: 约 10,000 行
- **后端代码**: 约 6,000 行
- **测试代码**: 约 4,500 行
- **文档**: 约 15,000 行
- **总计**: 约 35,000 行

#### 功能模块
- **已完成**: 12 个核心模块
- **测试覆盖**: 100+ 测试用例
- **API 接口**: 80+ 个端点
- **前端页面**: 17 个主要视图
- **可复用组件**: 20+ 个

#### 开发效率
- **总开发时长**: 约 20 天 (单人)
- **平均每天产出**: 1,600-1,750 行代码
- **最快模块**: 产品管理 (3.5 小时完成 CRUD + 测试)
- **最复杂模块**: 页面编辑器 (3 天,包含 12 种区块)

### 技术亮点

#### 1. 区块化内容系统
- 12 种区块类型
- JSON 配置存储
- 拖拽排序
- 可视化编辑

#### 2. 动态菜单导航
- 树形结构
- 三种栏目类型
- 自动生成导航
- 路由智能映射

#### 3. TDD 开发实践
- 100+ 测试用例
- Store 覆盖率 > 90%
- 组件覆盖率 > 80%
- API 测试 100% 通过

#### 4. 完善的文档
- 20+ 份文档
- 详细的开发进度
- 技术决策记录
- Bug 修复记录

### 项目成熟度

#### 生产就绪评估

| 评估项 | 完成度 | 说明 |
|-------|--------|------|
| 核心功能 | 85% | 主要模块已完成 |
| 测试覆盖 | 80%+ | TDD 开发模式 |
| 文档完整性 | 95% | 详细文档和注释 |
| 安全性 | 90% | JWT、RBAC、文件验证 |
| 性能优化 | 70% | 基础优化完成 |
| 错误处理 | 85% | 统一错误处理 |
| 用户体验 | 90% | 加载/空状态/确认 |

### 下一步计划

#### 短期 (1-2 周)
- 完善辅助功能 (表单详情、用户编辑)
- 实现主题设置 (Design Tokens)
- 优化响应式布局
- 添加全局搜索

#### 中期 (1 个月)
- 开发前端网站 (Nuxt 3)
- SEO 优化 (SSG、Sitemap)
- 性能优化 (代码分割、CDN)
- E2E 测试 (Playwright)

#### 长期 (2-3 个月)
- v2.0 功能 (电商、AI)
- 插件系统
- S3 存储支持
- 多语言 (i18n)

---

## 结论

### 核心经验总结

#### 1. 文档是基石
没有详细的 PRD 和实施计划,AI 无法理解你的需求。**先写文档,后写代码**。

#### 2. TDD 是防护网
测试驱动开发防止 AI "幻觉",确保代码质量。**先测试,后实现**。

#### 3. 分阶段推进
复杂项目必须分阶段,每个阶段 2-3 天。**小步快跑,快速迭代**。

#### 4. 参考现有代码
告诉 AI 参考哪些已完成的代码,保持一致性。**复用优于重写**。

#### 5. 人机协作
AI 是工具,不是替代品。**AI 写代码,人类做决策**。

### 使用 Claude Code 的最佳心智模型

把 Claude Code 想象成一个**高级助理工程师**:
- ✅ 可以写代码、写测试、修 Bug
- ✅ 可以参考文档和现有代码
- ✅ 可以执行明确的任务
- ❌ 不能理解业务需求
- ❌ 不能做架构设计
- ❌ 不能判断技术方向

你的角色是**技术 Lead**:
- 编写需求文档
- 设计系统架构
- 制定开发计划
- 审查 AI 代码
- 做技术决策

### 最后的建议

#### 给初学者
1. 从小项目开始 (不要一上来就全栈)
2. 先学会写提示词 (提示词是编程语言)
3. 必须学习基础知识 (AI 不能代替学习)
4. 多看 AI 生成的代码 (学习优秀实践)

#### 给有经验的开发者
1. 把 AI 当作结对编程伙伴
2. 用 TDD 约束 AI 的输出
3. 建立项目模板和文档模板
4. 持续优化提示词策略

#### 给团队负责人
1. 制定 AI 辅助开发规范
2. 建立代码审查机制
3. 投资于文档和测试
4. 培训团队成员使用 AI

---

## 附录

### A. 常用提示词模板

#### 项目初始化
```
初始化一个 [技术栈] 项目,包含:
- 目录结构
- 配置文件 (tsconfig, vite.config, etc.)
- package.json 依赖
- 启动脚本
- README.md

要求:
- TypeScript 严格模式
- ESLint + Prettier
- [其他要求]
```

#### TDD 测试编写
```
为 [模块名] 编写单元测试,覆盖以下场景:
1. [场景1]
2. [场景2]
3. [场景3]

要求:
- 使用 [测试框架]
- Mock 外部依赖
- 至少 [N] 个测试用例
- 禁止实现功能代码

完成后告诉我:"测试编写完成,[N] 个测试待通过"
```

#### 功能实现
```
实现 [功能名],参考 [现有代码]:

【功能需求】
1. [需求1]
2. [需求2]

【API 接口】
- [端点1]
- [端点2]

【表单验证】
- [规则1]
- [规则2]

【要求】
- 使用 [框架/库]
- 编写 [N] 个测试
- 处理加载/错误/空状态

请先编写测试,再实现功能。
```

#### Bug 修复
```
【Bug】[简短描述]

【现象】
[详细描述问题]

【调试信息】
[代码片段、API 响应、数据库数据]

【问题分析】
[你的推理]

【修复方案】
请修改 [文件名],实现:
1. [修复步骤1]
2. [修复步骤2]

【验证】
修复后请测试 [验证步骤]
```

### B. CLAUDE.md 模板

```markdown
# CLAUDE.md

## 项目概览
- **项目名称**: [名称]
- **项目定位**: [一句话描述]
- **当前阶段**: [规划/开发/测试/生产]
- **技术栈**: [主要技术]

## 项目结构
```
[目录树]
```

## 核心架构
### [架构特点1]
[描述]

### [架构特点2]
[描述]

## 开发规范
### 代码风格
- [规范1]
- [规范2]

### 测试策略
- [策略1]
- [策略2]

### Git 提交
- [规范]

## 技术决策
### 为什么选择 [技术A]?
[原因]

### 为什么不用 [技术B]?
[原因]

## 已完成功能
- ✅ [功能1] (N tests)
- ✅ [功能2] (N tests)

## 待开发功能
- ⏳ [功能3]
- ⏳ [功能4]

## 常见问题
### [问题1]
[回答]

### [问题2]
[回答]
```

### C. 测试模板

```typescript
// tests/stores/example.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExampleStore } from '@/stores/example'

describe('ExampleStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('初始化', () => {
    it('should have default state', () => {
      const store = useExampleStore()
      expect(store.items).toEqual([])
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchItems', () => {
    it('should fetch items from API', async () => {
      const store = useExampleStore()
      // Mock API
      // 调用方法
      // 断言结果
    })

    it('should handle API error', async () => {
      // 测试错误情况
    })
  })

  // 更多测试...
})
```

### D. 组件模板

```vue
<!-- src/views/example/ExampleList.vue -->
<template>
  <div class="example-list">
    <!-- Header -->
    <n-page-header>
      <template #title>[模块名]</template>
      <template #extra>
        <n-button type="primary" @click="handleCreate">
          新建
        </n-button>
      </template>
    </n-page-header>

    <!-- Filters -->
    <n-card class="filter-card">
      <n-space>
        <n-input v-model:value="keyword" placeholder="搜索..." @keyup.enter="handleSearch" />
        <n-select v-model:value="statusFilter" :options="statusOptions" placeholder="状态" />
        <n-button @click="handleSearch">搜索</n-button>
        <n-button @click="handleReset">重置</n-button>
      </n-space>
    </n-card>

    <!-- Data Table -->
    <n-card class="table-card">
      <n-data-table
        :columns="columns"
        :data="items"
        :loading="loading"
        :pagination="pagination"
        @update:page="handlePageChange"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { getItemList, deleteItem } from '@/api/example'

const router = useRouter()
const message = useMessage()

// State
const items = ref([])
const loading = ref(false)
const keyword = ref('')
const statusFilter = ref(null)
const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0
})

// Columns
const columns = [
  // 定义列
]

// Methods
async function fetchData() {
  loading.value = true
  try {
    const response = await getItemList({
      page: pagination.page,
      limit: pagination.pageSize,
      keyword: keyword.value,
      status: statusFilter.value
    })
    items.value = response.data
    pagination.itemCount = response.total
  } catch (error) {
    message.error('加载失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function handleReset() {
  keyword.value = ''
  statusFilter.value = null
  pagination.page = 1
  fetchData()
}

function handleCreate() {
  router.push('/example/create')
}

function handlePageChange(page: number) {
  pagination.page = page
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.example-list {
  padding: 24px;
}

.filter-card,
.table-card {
  margin-top: 16px;
}
</style>
```

---

## 参考资源

### 官方文档
- [Claude Code 官方文档](https://docs.anthropic.com/claude/docs)
- [Vue 3 官方文档](https://vuejs.org/)
- [NestJS 官方文档](https://nestjs.com/)
- [Prisma 官方文档](https://www.prisma.io/docs)

### 最佳实践指南
- [Claude Code 最佳实践](https://docs.anthropic.com/claude/docs/best-practices)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [TDD Best Practices](https://testdriven.io/)

### 社区资源
- [Claude Code 中文社区](https://zhuanlan.zhihu.com/p/1920263182062163086)
- [Awesome Claude Code](https://github.com/topics/claude-code)

---

**版本**: 1.0.0
**日期**: 2025-10-24
**作者**: [你的名字]
**项目**: Docms CMS (https://github.com/your-username/docms)

---

如果本文对你有帮助,请给项目点个 Star ⭐!
