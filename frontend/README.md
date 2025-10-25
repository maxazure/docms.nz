# 企业网站前台 (Frontend)

这是使用 Nuxt 3 构建的企业网站前台应用，用于展示和渲染来自 CMS 后端的内容。

## 技术栈

- **Nuxt 3** - Vue 3 框架，支持 SSR/SSG
- **TypeScript** - 类型安全
- **Vue 3** - 组合式 API
- **Vite** - 快速的开发服务器和构建工具

## 项目结构

```
app/
├── assets/          # 静态资源（样式、图片等）
│   └── css/         # 全局样式
├── components/      # Vue 组件
│   ├── blocks/      # 区块组件（Hero, Text, Features 等）
│   ├── layout/      # 布局组件（Header, Footer）
│   └── renderers/   # 内容渲染器（Page, Post, Product）
├── composables/     # 组合式函数
│   └── useApi.ts    # API 数据获取
├── layouts/         # 页面布局
│   └── default.vue  # 默认布局
├── pages/           # 路由页面
│   └── [...slug].vue # 动态路由（捕获所有路径）
├── types/           # TypeScript 类型定义
└── app.vue          # 应用入口
```

## 核心功能

### 1. 动态路由系统
使用 `[...slug].vue` 实现通配符路由，所有页面路径都会被捕获并动态渲染。

### 2. 区块化页面构建
页面由多个可复用的区块组件组成（Hero, Text, ImageGallery, Features, Form等）。

### 3. 主题化系统
从 API 获取主题配置并自动应用到 CSS 变量。

### 4. SEO 优化
支持 SSR/SSG、动态 Meta 标签、Open Graph。

## 开发指南

### 启动开发服务器

```bash
# 确保 API 服务器正在运行（端口 3000）
cd D:\projects\docms.nz\api
npm run start:dev

# 启动前台开发服务器
cd D:\projects\docms.nz\frontend
npm run dev
```

访问: `http://localhost:3001`

### 构建生产版本

```bash
# SSR 模式
npm run build

# SSG 模式（静态站点生成）
npm run generate
```

## API 集成

前台通过 `useApi()` composable 与后端 API 通信：

- `GET /sites` → 站点信息
- `GET /menu-items?menuCode=main` → 主导航菜单
- `GET /menu-items/slug/:slug` → 根据 slug 获取内容
- `GET /posts` → 文章列表
- `GET /products` → 产品列表

## 相关文档

- [Nuxt 3 文档](https://nuxt.com)
- [项目 PRD](../CMS-PRD-v1.0.md)
- [API 文档](../api/README.md)

