# Docms 管理后台实现计划

## 项目概览
- **技术栈**: Vue 3 + TypeScript + Vite + Naive UI + Pinia + Vue Router
- **API 基础**: NestJS Backend (已实现认证、权限模块)
- **设计理念**: 直觉式操作、零学习成本、网站栏目为主导航

## 实现阶段

### 阶段 1: 项目基建 ✓
- [x] 初始化 Vite + Vue3 + TypeScript 项目
- [x] 配置 Naive UI 主题
- [x] 设置 Pinia 状态管理
- [x] 配置 Vue Router
- [x] 设置 Axios + API Client
- [x] 配置环境变量
- [x] 设置 ESLint + Prettier

### 阶段 2: 认证与布局框架
- [ ] 实现登录页面
- [ ] 实现认证状态管理 (Pinia Store)
- [ ] 实现 JWT Token 管理
- [ ] 实现路由守卫
- [ ] 创建主布局组件 (左侧导航 + 顶部栏 + 内容区)
- [ ] 实现用户菜单 (退出登录、个人信息)

### 阶段 3: 动态网站栏目导航
- [ ] 实现菜单数据获取 (GET /api/menu-items?menuCode=main)
- [ ] 实现左侧动态树形导航组件
- [ ] 支持多级展开折叠
- [ ] 根据栏目类型路由到不同编辑界面
- [ ] 实现导航状态持久化

### 阶段 4: 菜单管理模块
- [ ] 菜单列表页 (树形展示)
- [ ] 添加/编辑栏目表单
  - [ ] 栏目名称、URL Slug
  - [ ] 栏目类型选择 (Page/PostList/Product)
  - [ ] 父级栏目选择
  - [ ] 排序、显隐设置
- [ ] 拖拽排序功能
- [ ] 删除栏目功能
- [ ] 实时同步左侧导航

### 阶段 5: 媒体库模块
- [ ] 媒体列表页 (网格/列表视图切换)
- [ ] 图片上传功能 (拖拽 + 选择)
- [ ] 图片详情编辑 (alt、标题等)
- [ ] 图片预览功能
- [ ] 图片删除功能
- [ ] 媒体选择器组件 (供其他模块调用)
- [ ] 支持筛选和搜索

### 阶段 6: 页面管理模块 (区块编辑器)
- [ ] 页面列表页
- [ ] 区块类型定义和配置
- [ ] 区块编辑器主界面
  - [ ] 左侧: 区块列表 (拖拽排序)
  - [ ] 右侧: 区块配置面板
- [ ] 区块选择器 (添加新区块)
- [ ] 实现各类区块配置组件:
  - [ ] Hero 横幅区块
  - [ ] 文本区块 (富文本编辑器)
  - [ ] 图片画廊区块
  - [ ] 特点区块
  - [ ] CTA 区块
  - [ ] FAQ 区块
  - [ ] 产品展示区块
  - [ ] 评价区块
  - [ ] 联系表单区块
  - [ ] 地图区块
  - [ ] 视频区块
  - [ ] 分隔符区块
- [ ] 区块预览模式
- [ ] 区块复制/删除功能
- [ ] 草稿/发布状态管理
- [ ] 自动保存功能 (防抖)
- [ ] 版本历史 (可选)

### 阶段 7: 文章管理模块
- [ ] 文章列表页
  - [ ] 搜索功能
  - [ ] 分类/标签筛选
  - [ ] 状态筛选 (草稿/已发布)
  - [ ] 分页
- [ ] 文章编辑页
  - [ ] 标题、URL Slug
  - [ ] 摘要
  - [ ] 正文 (富文本编辑器)
  - [ ] 封面图片选择
  - [ ] 分类选择
  - [ ] 标签管理
  - [ ] SEO 设置
  - [ ] 发布状态控制
- [ ] 分类管理
- [ ] 标签管理

### 阶段 8: 产品管理模块
- [ ] 产品列表页
  - [ ] 搜索功能
  - [ ] 分类筛选
  - [ ] 状态筛选 (上架/下架)
  - [ ] 分页
- [ ] 产品编辑页
  - [ ] 产品名称、URL Slug
  - [ ] 摘要
  - [ ] 描述 (富文本/区块)
  - [ ] 规格参数编辑 (JSON 编辑器)
  - [ ] 图集管理
  - [ ] 价格设置
  - [ ] 分类选择
  - [ ] 标签
  - [ ] 上架开关
  - [ ] Featured 标记
  - [ ] SEO 设置

### 阶段 9: 表单管理模块
- [ ] 表单提交列表页
  - [ ] 按表单类型筛选
  - [ ] 搜索功能
  - [ ] 分页
- [ ] 提交详情查看
- [ ] 导出 CSV 功能
- [ ] 表单构建器 (可选，v1.0 可简化)

### 阶段 10: 站点设置模块
- [ ] 基本信息设置
  - [ ] 站点名称、域名
  - [ ] Logo 上传
  - [ ] ICP 备案信息
- [ ] 主题设置 (Design Tokens)
  - [ ] 主色调
  - [ ] 字体设置
  - [ ] 圆角、阴影等
- [ ] SEO 默认设置
- [ ] 社交媒体链接

### 阶段 11: 用户与权限模块
- [ ] 用户列表
- [ ] 添加/编辑用户
- [ ] 角色管理
- [ ] 权限矩阵展示

### 阶段 12: 审计日志模块
- [ ] 日志列表页
- [ ] 筛选功能 (用户、操作类型、时间)
- [ ] 日志详情查看

### 阶段 13: 仪表盘 (Dashboard)
- [ ] 内容统计卡片
- [ ] 最近操作列表
- [ ] 最新表单提交
- [ ] 快速操作入口

### 阶段 14: 全局功能
- [ ] 全局搜索功能
- [ ] 主题切换 (亮色/暗色)
- [ ] 多语言支持框架 (i18n)
- [ ] 面包屑导航
- [ ] 错误处理和提示
- [ ] 加载状态管理

### 阶段 15: 优化与测试
- [ ] 响应式布局优化
- [ ] 无障碍支持 (ARIA)
- [ ] 性能优化
  - [ ] 代码分割
  - [ ] 懒加载
  - [ ] 图片优化
- [ ] 单元测试
- [ ] E2E 测试
- [ ] 浏览器兼容性测试

## 技术决策

### UI 组件库: Naive UI
- 现代化设计
- TypeScript 友好
- 组件丰富
- 可定制性强

### 富文本编辑器: TinyMCE / Quill
- TinyMCE: 功能强大，插件丰富
- Quill: 轻量级，易于集成

### 拖拽库: VueDraggable Next
- Vue 3 兼容
- 成熟稳定

### 状态管理: Pinia
- Vue 3 官方推荐
- TypeScript 支持好
- API 简洁

### 图标库: @vicons (Naive UI 配套)
- 多套图标库整合
- 按需引入

## API 集成清单

### 已实现 API
- [x] POST /auth/register
- [x] POST /auth/login
- [x] POST /auth/refresh
- [x] POST /auth/logout
- [x] GET /auth/profile
- [x] GET /api/permissions
- [x] GET /api/permissions/hierarchy

### 待对接 API (需要后端实现)
- [ ] GET /api/menu-items (菜单列表)
- [ ] POST /api/menu-items (创建菜单)
- [ ] PUT /api/menu-items/:id (更新菜单)
- [ ] DELETE /api/menu-items/:id (删除菜单)
- [ ] GET /api/pages (页面列表)
- [ ] POST /api/pages (创建页面)
- [ ] PUT /api/pages/:id (更新页面)
- [ ] GET /api/posts (文章列表)
- [ ] POST /api/posts (创建文章)
- [ ] PUT /api/posts/:id (更新文章)
- [ ] GET /api/products (产品列表)
- [ ] POST /api/products (创建产品)
- [ ] PUT /api/products/:id (更新产品)
- [ ] POST /api/media/upload (上传媒体)
- [ ] GET /api/media (媒体列表)
- [ ] DELETE /api/media/:id (删除媒体)
- [ ] GET /api/site (站点信息)
- [ ] PUT /api/site (更新站点信息)
- [ ] GET /api/categories (分类列表)
- [ ] GET /api/tags (标签列表)
- [ ] GET /api/forms/submissions (表单提交列表)
- [ ] GET /api/blocks/types (区块类型列表)
- [ ] POST /api/blocks/validate (验证区块数据)

## 文件结构

```
admin/
├── public/
├── src/
│   ├── api/              # API 调用封装
│   │   ├── auth.ts
│   │   ├── menu.ts
│   │   ├── page.ts
│   │   ├── post.ts
│   │   ├── product.ts
│   │   ├── media.ts
│   │   ├── site.ts
│   │   └── index.ts
│   ├── assets/           # 静态资源
│   ├── components/       # 通用组件
│   │   ├── layout/
│   │   │   ├── AppLayout.vue
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppSidebar.vue
│   │   │   └── AppBreadcrumb.vue
│   │   ├── blocks/       # 区块组件
│   │   │   ├── BlockEditor.vue
│   │   │   ├── BlockSelector.vue
│   │   │   ├── BlockConfig/
│   │   │   └── ...
│   │   ├── media/
│   │   │   ├── MediaLibrary.vue
│   │   │   ├── MediaSelector.vue
│   │   │   └── MediaUploader.vue
│   │   └── common/       # 通用组件
│   ├── composables/      # 组合式函数
│   │   ├── useAuth.ts
│   │   ├── useMenu.ts
│   │   └── ...
│   ├── router/           # 路由配置
│   │   └── index.ts
│   ├── stores/           # Pinia 状态管理
│   │   ├── auth.ts
│   │   ├── menu.ts
│   │   ├── app.ts
│   │   └── index.ts
│   ├── types/            # TypeScript 类型定义
│   │   ├── api.ts
│   │   ├── menu.ts
│   │   ├── block.ts
│   │   └── ...
│   ├── utils/            # 工具函数
│   │   ├── request.ts
│   │   ├── storage.ts
│   │   └── ...
│   ├── views/            # 页面组件
│   │   ├── auth/
│   │   │   └── Login.vue
│   │   ├── dashboard/
│   │   │   └── Dashboard.vue
│   │   ├── menu/
│   │   │   └── MenuManagement.vue
│   │   ├── pages/
│   │   │   ├── PageList.vue
│   │   │   └── PageEditor.vue
│   │   ├── posts/
│   │   ├── products/
│   │   ├── media/
│   │   ├── forms/
│   │   ├── site/
│   │   └── ...
│   ├── App.vue
│   ├── main.ts
│   └── vite-env.d.ts
├── .env.development
├── .env.production
├── .eslintrc.js
├── .prettierrc
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 开发优先级

### P0 (最高优先级 - 核心功能)
1. 认证与布局框架
2. 动态网站栏目导航
3. 菜单管理模块
4. 媒体库模块
5. 页面管理模块 (区块编辑器)

### P1 (高优先级 - 主要内容管理)
6. 文章管理模块
7. 产品管理模块
8. 站点设置模块

### P2 (中优先级 - 辅助功能)
9. 表单管理模块
10. 用户与权限模块
11. 审计日志模块
12. 仪表盘

### P3 (低优先级 - 优化)
13. 全局功能优化
14. 测试和性能优化

## 开发时间估算

- 阶段 1-2: 2-3 天
- 阶段 3-5: 5-7 天
- 阶段 6: 7-10 天 (区块编辑器最复杂)
- 阶段 7-8: 5-7 天
- 阶段 9-12: 5-7 天
- 阶段 13-15: 3-5 天

**总计**: 约 27-39 天 (单人开发)

## 注意事项

1. **API 依赖**: 前端开发需要后端 API 支持，部分模块需要等待后端实现
2. **区块系统**: 这是最核心也最复杂的功能，需要充分理解 PRD 中的设计
3. **状态同步**: 菜单修改后需要实时同步左侧导航
4. **权限控制**: 所有操作都需要根据用户角色进行权限控制
5. **用户体验**: 重点关注直觉式操作，减少学习成本
6. **性能优化**: 区块编辑器、媒体库等需要特别注意性能

## 下一步行动

1. 创建 admin 项目基础结构
2. 配置开发环境
3. 实现认证功能
4. 开始构建核心布局
