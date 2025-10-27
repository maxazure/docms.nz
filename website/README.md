# Docms Website - 前台展示网站

这是Docms CMS的前台展示网站,基于Nuxt 3构建,支持SSR/SSG模式。

## 技术栈

- **框架**: Nuxt 3.4.2
- **语言**: TypeScript
- **UI框架**: Tailwind CSS
- **状态管理**: Nuxt内置状态管理
- **渲染模式**: SSR (Server-Side Rendering) / SSG (Static Site Generation)

## 项目结构

```
website/
├── app.vue                 # 应用入口
├── nuxt.config.ts         # Nuxt配置
├── tailwind.config.js     # Tailwind配置
├── .env                   # 环境变量
├── types/                 # TypeScript类型定义
│   └── index.ts
├── composables/           # 组合式函数
│   ├── useApi.ts         # API客户端
│   └── useSiteData.ts    # 站点数据管理
├── components/            # 组件
│   ├── layout/           # 布局组件
│   │   ├── AppHeader.vue
│   │   └── AppFooter.vue
│   └── blocks/           # 区块组件
│       ├── BlockRenderer.vue
│       ├── HeroBlock.vue
│       ├── TextBlock.vue
│       ├── FeaturesBlock.vue
│       └── ... (12种区块类型)
├── layouts/               # 布局模板
│   └── default.vue
├── pages/                 # 路由页面
│   ├── index.vue         # 首页
│   ├── [slug].vue        # 动态页面
│   ├── posts/            # 文章
│   │   ├── index.vue
│   │   └── [slug].vue
│   └── products/         # 产品
│       ├── index.vue
│       └── [slug].vue
└── public/               # 静态资源
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 单独启动 (端口 3001)
npm run dev

# 或使用项目根目录的启动脚本同时启动所有服务
cd ..
./start-dev.bat  # Windows
./start-dev.sh   # Linux/Mac
```

开发服务器会运行在: http://localhost:3001 (如端口被占用会使用3002)

### 生产构建

```bash
# 构建SSG静态站点
npm run generate

# 或构建SSR服务器
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 核心功能

### 1. 动态路由系统

- **首页**: `/` - 从API获取slug为"home"的Page并渲染区块
- **通用页面**: `/:slug` - 动态渲染任意Page
- **文章列表**: `/posts` - 分页显示文章,支持分类筛选
- **文章详情**: `/posts/:slug` - 显示文章详情,标签,评论
- **产品列表**: `/products` - 分页显示产品,支持分类筛选
- **产品详情**: `/products/:slug` - 显示产品详情,规格,图集

### 2. 区块渲染系统

支持12种区块类型:

1. **HeroBlock** - 横幅区块
2. **TextBlock** - 文本区块
3. **ImageGalleryBlock** - 图片画廊
4. **FeaturesBlock** - 特点展示
5. **CTABlock** - 行动号召
6. **FAQBlock** - 常见问题
7. **ProductShowcaseBlock** - 产品展示
8. **TestimonialsBlock** - 客户评价
9. **ContactFormBlock** - 联系表单
10. **MapBlock** - 地图
11. **VideoBlock** - 视频
12. **DividerBlock** - 分隔符

### 3. 主题系统

通过Design Tokens实现主题定制:

- 主色调 (--primary-color)
- 辅助色 (--secondary-color)
- 强调色 (--accent-color)
- 字体 (--font-family)
- 圆角 (--border-radius)
- 阴影 (--box-shadow)

### 4. SEO优化

- 每个页面支持自定义meta标签
- 自动生成OpenGraph标签
- 结构化数据 (JSON-LD)
- 友好的URL结构
- SSG模式生成静态HTML

## 环境变量

创建`.env`文件配置:

```env
NUXT_PUBLIC_API_BASE=http://localhost:3000/api
NUXT_PUBLIC_SITE_NAME=Docms Website
NUXT_PUBLIC_SITE_URL=http://localhost:3001
```

## API集成

### useApi Composable

```typescript
const api = useApi()

// 获取站点信息
const site = await api.site.get()

// 获取菜单
const menu = await api.menu.getAll('main')

// 获取页面
const page = await api.pages.getBySlug('home')

// 获取文章列表
const posts = await api.posts.getAll({ page: 1, limit: 10 })

// 获取产品
const products = await api.products.getAll({ page: 1, isActive: true })
```

### useSiteData Composable

```typescript
const { site, menu, themeVars, fetchSite, fetchMenu } = useSiteData()

// 获取站点数据
await fetchSite()

// 获取菜单
await fetchMenu('main')

// 应用主题变量
<div :style="themeVars">
```

## 开发注意事项

1. **TypeScript类型检查已禁用**: 为避免vue-tsc依赖,配置中`typeCheck`设为false
2. **端口自动选择**: 如3001被占用,会自动使用3002
3. **API依赖**: 需要先启动API服务器(localhost:3000)
4. **数据库**: 使用API项目的SQLite数据库

## 待完善功能

以下功能已创建基础结构,需要进一步完善:

- [ ] 完善所有12种区块组件的交互功能
- [ ] 实现SEO sitemap.xml和robots.txt
- [ ] 实现搜索功能
- [ ] 完善表单提交功能
- [ ] 添加更多页面过渡动画
- [ ] 优化移动端响应式设计
- [ ] 添加E2E测试

## 相关文档

- [Nuxt 3文档](https://nuxt.com/docs)
- [Tailwind CSS文档](https://tailwindcss.com/docs)
- [项目PRD](../CMS-PRD-v1.0.md)
- [执行计划](../CMS-v1.0-Execution-Plan.md)
