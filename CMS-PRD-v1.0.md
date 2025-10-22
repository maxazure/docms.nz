# CMS 产品需求文档（v1.0 - 更新版）

> **产品名称**：Docms  
> **定位**：单站点、开源、自托管的企业展示型 CMS。  
> **技术栈基线**：**Backend**：NestJS（Fastify 适配）+ Prisma + SQLite；**Admin**：Vue3 +（建议 Naive UI，可替换 Element Plus）；**Frontend**：Nuxt 3（SSR/SSG，强 SEO）。  
> **版本范围**：本文件为 **v1.0**（不含购买/支付与 AI 生成，均放到 v2.0）。

---

## 1. 初衷与愿景（从你的原始诉求抽炼）

* **开源与自主**：企业下载代码即可本地运行，数据完全自有，避免多租户和平台加价、隐私顾虑与锁定风险。
* **轻量与低成本**：后端坚持轻量（Node/TS + SQLite），不依赖重服务器、向量检索或耗资源服务；前台尽量 **SSG 静态化 + CDN**，把服务器压力降到最低。
* **现代后台体验**：以 **"网站栏目为主导航"** 的信息架构，界面风格现代、专业，所见即所得，企业用户零学习成本即可上手。
* **模板化前台**：像 WordPress 一样 "**按主题/模板换肤**"，并采用**区块化（Blocks）**思想；未来可结合 Codex 自动生成模板/区块，提高建站速度。
* **模块可拓展**：首页、单页、列表/详情、产品展示、留言/表单为核心；预约、购买/支付、AI 内容生成等通过后续版本与插件化机制扩展。

---

## 2. 目标用户与核心场景

* **站点管理员（企业运营/老板/市场）**：创建与维护栏目结构、页面与文章、上传媒体、配置菜单与 SEO、按主题换肤。
* **访客/潜在客户**：浏览公司信息、查看新闻/案例/产品、通过表单提交咨询。
* **（v2.0）内容创作人员**：上传资料，调用外部 AI API 生成"草稿"，再人审发布。

---

## 3. 功能范围（v1.0）

### 3.1 内容与结构

* **区块化栏目（Page with Blocks）**：首页、关于我们、联系我们、解决方案、技术支持等**单页栏目**；采用**区块化（Blocks）**存储与渲染。
* **文章列表（Post）**：新闻资讯等列表页，支持**多级分类**与**标签**，每篇文章包含标题/摘要/正文/封面/SEO 元信息。
* **产品展示（Product）**：产品中心各子分类（家庭/商业/智能/配件），产品目录与详情（**仅展示，无购买/购物车/订单**）。
* **媒体库（Media）**：图片/PDF/视频上传、替换与元信息管理（alt、尺寸等）。
* **菜单（Menu）**：主导航/页脚导航，树形编辑、拖拽排序、外链/站内链接、**栏目类型配置**。

### 3.2 站点级能力

* **主题/样式**：企业主题（颜色/字体/圆角/阴影等 **Design Tokens**），前台**区块化**组件渲染。
* **SEO**：可配置 `metaTitle / metaDescription / og:image / canonical`；自动 `sitemap.xml`、`robots.txt`、JSON-LD 结构化数据。
* **搜索**：全站搜索（标题/摘要/正文 *LIKE* 模糊查询；v1.0 不要求 FTS5）。
* **表单/留言**：通用表单（如"联系咨询"），后台可查看与导出。
* **权限与审计**：角色（Owner/Admin/Editor/Author/Viewer）；记录重要操作日志。

> **不在 v1.0 的能力**：购买/支付、预约、AI 生成（外部 API 调用）、文件解析自动草稿等，这些统归 **v2.0**。

---

## 4. 信息架构与交互要点（Admin）

### 4.1 导航结构（三级架构）

#### **核心设计理念：直觉式操作，零学习成本**

Docms 的后台导航采用"**网站栏目为主导航**"的信息架构，让用户能够**凭直觉**对内容进行增删改查，无需学习成本。用户在"菜单管理"中配置的栏目会**自动映射**到左侧"网站栏目"导航，点击即可直接编辑对应内容。

#### **一级：网站栏目（动态生成）**

**重要说明**：
1. **动态性**：左侧"网站栏目"导航是**根据菜单管理中的配置动态生成**的，并非硬编码。
2. **默认状态**：系统初始状态下，如果用户未在"菜单管理"中添加任何栏目，网站栏目菜单下**仅显示"首页"**一个项目。
3. **自动同步**：当用户在"菜单管理"中添加新栏目（如"产品中心"、"新闻资讯"等）后，这些栏目会**立即出现**在左侧"网站栏目"导航中。
4. **层级关系**：如果栏目有子级（如"产品中心"下的"家庭水培设备"、"商业水培系统"等），左侧导航会显示为**可展开折叠**的树形结构。

**示例状态**（当用户在菜单管理中配置完成后）：
* 🏠 首页
* 📦 产品中心（可展开折叠）
  * 家庭水培设备
  * 商业水培系统
  * 智能水培设备
  * 水培配件
* 💡 解决方案
* 🔧 技术支持
* 📰 新闻资讯
* ℹ️ 关于我们
* 📞 联系我们

**交互说明**：
* 点击栏目名称：直接进入该栏目的编辑页面（根据栏目类型显示不同的编辑界面）
* 不同栏目类型对应不同的编辑体验（详见 4.2 节）

#### **二级：内容管理**
* 媒体库
* 留言管理

#### **三级：系统设置**
* 菜单管理（栏目配置中心）
* 站点设置
* 用户与权限
* 审计日志

---

### 4.2 栏目类型与编辑方式

#### **栏目类型系统**

**核心概念**：在菜单管理中添加栏目时，管理员需要为每个栏目**指定类型**，系统会根据类型提供不同的编辑界面和数据管理方式。

**支持的栏目类型（v1.0）**：

1. **单页模块（Page）**
   * **用途**：适用于首页、关于我们、联系我们、解决方案、技术支持等固定内容页面
   * **编辑方式**：使用**区块编辑器**（Blocks Editor）
   * **特点**：采用可视化区块拖拽编辑，支持所见即所得
   * **示例栏目**：首页、关于我们、联系我们、解决方案、技术支持

2. **文章列表模块（Post List）**
   * **用途**：适用于新闻中心、博客、案例展示等需要持续更新的内容
   * **编辑方式**：列表 + 详情编辑模式
   * **特点**：支持分类、标签、发布状态管理
   * **示例栏目**：新闻资讯、公司动态、行业资讯

3. **产品模块（Product）**
   * **用途**：适用于产品展示、产品中心等电商类内容（v1.0 仅展示，不含购买功能）
   * **编辑方式**：产品列表 + 详情编辑模式
   * **特点**：支持产品分类、规格参数、图集、价格展示、上架开关
   * **示例栏目**：产品中心及其子分类（家庭水培设备、商业水培系统等）

#### **栏目类型配置流程**

**在菜单管理中添加栏目时的操作步骤**：

1. 进入"系统设置" → "菜单管理"
2. 点击"添加栏目"按钮
3. 填写栏目基本信息：
   * **栏目名称**（如："产品中心"）
   * **URL Slug**（如："products"）
   * **栏目类型**（下拉选择）：
     * 单页模块（Page）
     * 文章列表模块（Post List）
     * 产品模块（Product）
   * **排序**（数字，决定在导航中的顺序）
   * **是否显示在导航**（开关）
   * **父级栏目**（可选，用于创建多级菜单）
4. 保存后，该栏目会**立即出现**在左侧"网站栏目"导航中
5. 点击左侧导航的栏目名称，系统会**根据栏目类型**自动加载对应的编辑界面

#### **不同类型栏目的编辑体验**

**单页模块编辑界面**：
* 使用 **区块编辑面板**，提供常用企业区块类型（详见 4.4）
* 支持拖拽排序、复制、删除区块
* 所见即所得 + 实时预览
* 草稿/发布双态 + 版本历史

**文章列表模块编辑界面**：
* **列表页**：搜索、筛选、分页、批量操作
* **详情页**：标题/摘要/正文/封面/分类/标签/SEO/发布状态

**产品模块编辑界面**：
* **列表页**：搜索、筛选、分页、批量操作
* **详情页**：名称/摘要/描述/规格参数（JSON）/图集/价格/分类/上架开关/SEO

#### **直觉式导航逻辑**

**设计目标**：用户不需要理解"后台概念"，只需要知道"我要编辑首页"或"我要添加一篇新闻"。

**实现方式**：
* 用户在左侧导航点击"首页"→ 系统自动打开区块编辑器
* 用户在左侧导航点击"新闻资讯"→ 系统自动显示文章列表
* 用户在左侧导航点击"产品中心"→ 系统自动显示产品列表
* 系统根据栏目类型**智能判断**应该展示什么样的编辑界面，用户无需学习

---

### 4.3 菜单管理详解

**菜单管理的核心职责**：
1. 配置网站栏目结构（哪些栏目、什么类型、什么顺序）
2. 管理前台导航菜单（主导航、页脚导航等）
3. 作为"网站栏目"左侧导航的**数据源**

**菜单管理界面功能**：

* **树形可视化编辑**：
  * 展示所有已配置的栏目
  * 支持拖拽调整层级与顺序
  * 支持折叠/展开多级菜单

* **栏目配置项**：
  * 栏目名称
  * URL Slug
  * **栏目类型**（单页/文章列表/产品模块）
  * 排序权重
  * 是否启用
  * 是否显示在前台导航
  * 父级栏目（用于多级菜单）
  * 图标（可选，用于左侧导航显示）

* **链接类型支持**：
  * **站内栏目**：从已配置的栏目中选择
  * **外部链接**：手动输入 URL（如：https://example.com）
  * **站内页面**：从已发布的 Page/Post/Product 中选择

* **菜单位置管理**：
  * 主导航菜单（Primary Menu）
  * 页脚导航菜单（Footer Menu）
  * 侧边栏菜单（Sidebar Menu，可选）

---

### 4.4 版本控制

* 所有内容自动保存历史版本（保留近 10 版）
* 支持对比差异与一键回滚

---

### 4.5 区块化（Blocks）设计详解

#### 4.5.1 区块系统架构

**区块定义**：
每个区块是一个独立的内容单元，包含：
```json
{
  "id": "block_uuid",
  "type": "hero|text|imageGallery|features|cta|faq|productShowcase|testimonials|...",
  "props": {
    // 区块特定的配置数据
  },
  "order": 1,
  "visibility": true
}
```

**存储方式**：
* Page 表的 `blocks` 字段存储为 JSON 数组
* 前台渲染时遍历数组，根据 `type` 动态加载对应组件

**区块注册机制**：
* 后端维护区块类型注册表（`BlockRegistry`）
* 前端组件库与后端类型映射
* 支持插件注册自定义区块（v2.0+）

#### 4.5.2 核心区块类型（v1.0）

**1. Hero 横幅区块** (`hero`)
* 用途：首页顶部大图横幅
* 配置项：
  * 主标题（文本）
  * 副标题（文本）
  * 背景图片（Media ID）
  * CTA 按钮（文本 + 链接）
  * 高度（small/medium/large/full）
  * 文字位置（left/center/right）

**2. 文本区块** (`text`)
* 用途：段落、标题、富文本内容
* 配置项：
  * 内容（富文本 HTML 或 Markdown）
  * 对齐方式（left/center/right）
  * 最大宽度（narrow/medium/wide/full）

**3. 图片组/画廊区块** (`imageGallery`)
* 用途：多图展示
* 配置项：
  * 图片数组（Media IDs）
  * 布局模式（grid/carousel/masonry）
  * 列数（2/3/4）
  * 图片比例（1:1/4:3/16:9）
  * 点击行为（lightbox/none）

**4. 特点/要点区块** (`features`)
* 用途：产品特点、服务优势等
* 配置项：
  * 特点列表数组：[{icon, title, description}]
  * 布局（2列/3列/4列）
  * 样式（卡片/图标+文字）

**5. CTA 行动号召区块** (`cta`)
* 用途：引导用户行动
* 配置项：
  * 标题
  * 描述文字
  * 按钮文本 + 链接
  * 背景色/背景图
  * 样式（居中/左右分栏）

**6. FAQ 常见问题区块** (`faq`)
* 用途：折叠式问答列表
* 配置项：
  * 问题数组：[{question, answer}]
  * 展开模式（单开/多开）
  * 样式（手风琴/卡片）

**7. 产品展示区块** (`productShowcase`)
* 用途：在其他页面展示产品
* 配置项：
  * 产品选择（手动选择 Product IDs 或自动拉取）
  * 数量限制
  * 布局（轮播/网格）
  * 显示字段（标题/价格/图片/摘要）

**8. 客户评价/案例区块** (`testimonials`)
* 用途：展示客户反馈
* 配置项：
  * 评价列表：[{avatar, name, company, content, rating}]
  * 布局（卡片/轮播）

**9. 联系表单区块** (`contactForm`)
* 用途：嵌入页面的表单
* 配置项：
  * 表单 Code（关联 FormSubmission）
  * 字段定义：[{name, type, required, placeholder}]
  * 提交按钮文字
  * 成功提示

**10. 地图区块** (`map`)
* 用途：嵌入地图
* 配置项：
  * 经纬度
  * 缩放级别
  * 标记点信息
  * 地图服务商（百度/高德/Google）

**11. 视频区块** (`video`)
* 用途：嵌入视频
* 配置项：
  * 视频源（Media ID / YouTube / Vimeo URL）
  * 封面图
  * 自动播放
  * 尺寸比例

**12. 分隔符区块** (`divider`)
* 用途：视觉分隔
* 配置项：
  * 样式（线条/空白）
  * 间距大小

#### 4.5.3 区块编辑器交互设计

**编辑模式**：
1. **列表视图**（默认）：
   * 左侧区块列表，显示区块类型图标 + 标题
   * 右侧配置面板，编辑当前选中区块
   * 拖拽手柄调整顺序

2. **预览视图**：
   * 实时渲染前台效果
   * 叠加编辑工具条（编辑/复制/删除）
   * 点击区块直接进入编辑

**添加区块流程**：
1. 点击"+ 添加区块"按钮
2. 弹出区块选择器（按类型分组）
3. 选择区块类型后插入到当前位置
4. 自动聚焦到配置面板

**编辑区块流程**：
1. 点击区块进入编辑状态
2. 右侧配置面板显示该区块的所有配置项
3. 实时预览变化
4. 自动保存（防抖 2 秒）

**区块操作**：
* 拖拽排序（上下移动）
* 复制区块（快速创建相似区块）
* 删除区块（二次确认）
* 折叠/展开（列表模式）
* 显示/隐藏（控制前台可见性）

**媒体选择器集成**：
* 区块配置中的图片字段点击后打开媒体库弹窗
* 支持上传新图片或从已有媒体中选择
* 支持裁剪与预览

#### 4.5.4 区块数据示例

```json
{
  "blocks": [
    {
      "id": "hero_001",
      "type": "hero",
      "order": 1,
      "visibility": true,
      "props": {
        "title": "智能水培设备领导品牌",
        "subtitle": "为家庭和企业提供专业水培解决方案",
        "backgroundImage": "media_123",
        "ctaText": "查看产品",
        "ctaLink": "/products",
        "height": "large",
        "textAlign": "center"
      }
    },
    {
      "id": "features_001",
      "type": "features",
      "order": 2,
      "visibility": true,
      "props": {
        "items": [
          {
            "icon": "🌱",
            "title": "智能控制",
            "description": "自动调节光照、温度、湿度"
          },
          {
            "icon": "💧",
            "title": "节水环保",
            "description": "比传统种植节水90%"
          },
          {
            "icon": "📱",
            "title": "远程监控",
            "description": "手机APP实时查看生长状态"
          },
          {
            "icon": "🏆",
            "title": "品质保证",
            "description": "ISO9001认证，5年质保"
          }
        ],
        "columns": 4,
        "style": "card"
      }
    },
    {
      "id": "cta_001",
      "type": "cta",
      "order": 3,
      "visibility": true,
      "props": {
        "title": "开始您的智能种植之旅",
        "description": "立即联系我们，获取专业咨询和定制方案",
        "buttonText": "免费咨询",
        "buttonLink": "/contact",
        "backgroundColor": "#52c41a",
        "layout": "center"
      }
    }
  ]
}
```

#### 4.5.5 区块渲染流程（前台）

1. **SSG 构建时**：
   * 读取 Page 表的 `blocks` JSON
   * 遍历区块数组
   * 根据 `type` 加载对应的 Vue/Nuxt 组件
   * 传入 `props` 渲染组件
   * 生成静态 HTML

2. **运行时（客户端）**：
   * 对于需要交互的区块（如 FAQ、Carousel），hydrate 为动态组件
   * 懒加载非首屏区块
   * 图片使用响应式加载

3. **主题定制**：
   * 区块组件读取站点 Design Tokens
   * 应用主题色、字体、圆角等样式变量
   * 支持主题级别的区块样式覆盖

---

## 5. 前后端架构（建议实现）

* **Backend**：NestJS（Fastify 适配）+ Prisma + SQLite（WAL 模式）；OpenAPI/Swagger 自动产出。
  * 选 **Naive UI** 作为后台 UI（可替换 Element Plus）。
* **Frontend**：Nuxt 3（SSR/SSG），企业主题 + 区块库；发布时触发**局部静态重建**并推送到 CDN。
* **存储**：本地 `/uploads` 起步，后续可接 S3 兼容存储（v2.0+）。
* **部署**：docker-compose（api / admin / nuxt-ssg）。备份即拷贝 `app.db` + `/uploads`。

---

## 6. 数据库结构（SQLite / Prisma 友好，v1.0）

> 说明：以下为逻辑结构（**不含代码**）。`?` 为可空；`JSON` 实际以 `TEXT` 存储 JSON 字符串。所有主表默认包含 `createdAt`（和可选 `updatedAt`）。

### 6.1 用户与权限

* **User**
  * `id PK`
  * `email UNIQUE`
  * `passwordHash`
  * `displayName`
  * `role` *(enum: owner | admin | editor | author | viewer)*
  * `createdAt`

* **AuditLog**
  * `id PK`
  * `userId FK User`
  * `action` *(string)*
  * `resourceType` *(string)* / `resourceId` *(string|number)*
  * `payload JSON?`
  * `createdAt`

### 6.2 站点与导航

* **Site** *(单站点一条记录)*
  * `id PK`
  * `name`
  * `domain UNIQUE`
  * `locale` *(默认如 "en" 或 "zh")*
  * `themeTokens JSON` *(颜色/字体/圆角/阴影/间距等)*
  * `settings JSON` *(站点级配置：Logo、ICP、社媒链接等)*
  * `createdAt`

* **MenuItem** *(重要修改：栏目/菜单项)*
  * `id PK`
  * `menuCode` *(如 "main" / "footer"，用于区分主导航、页脚导航等)*
  * `label` *(显示名称，如 "产品中心")*
  * `slug UNIQUE` *(URL 路径，如 "products")*
  * **`type` *(enum: page | postList | product)*** **← 核心新增字段**
  * `linkType` *(enum: internal | external | custom)*
  * `linkTarget?` *(外部链接时的 URL，或站内链接时的资源 ID)*
  * `parentId FK MenuItem?` *(父级菜单，支持多级)*
  * `order` *(int，排序权重)*
  * `icon?` *(图标名称/类名)*
  * `isVisible` *(bool，是否显示在前台导航)*
  * `isActive` *(bool，是否启用)*
  * `createdAt`
  * `updatedAt`

> **设计说明**：
> 1. `MenuItem` 表既是前台菜单的数据源，也是后台"网站栏目"导航的数据源。
> 2. `type` 字段决定了点击该菜单项时应该显示什么样的编辑界面：
>    - `page`：打开区块编辑器
>    - `postList`：打开文章列表管理
>    - `product`：打开产品列表管理
> 3. 当 `menuCode` 为 `main` 时，这些记录会被用于生成左侧"网站栏目"导航。
> 4. 系统初始化时，自动创建一条 `slug="home"`, `type="page"`, `label="首页"` 的记录。

### 6.3 内容模型

* **Category** *(多级分类)*
  * `id PK`
  * `name`
  * `slug UNIQUE`
  * `parentId FK Category?`
  * `order` *(int)*
  * `isActive` *(bool)*

* **Tag**
  * `id PK`
  * `name`
  * `slug UNIQUE`

* **Post** *(新闻/博客)*
  * `id PK`
  * `menuItemId FK MenuItem?` *(关联到栏目，标识属于哪个"文章列表模块")*
  * `title`
  * `slug UNIQUE`
  * `summary?`
  * `content JSON?` *(富文本/区块 JSON)*
  * `coverImageId FK Media?`
  * `status` *(enum: draft | published)*
  * `publishedAt?`
  * `authorId FK User`
  * `meta JSON?` *(title/description/og/canonical 等)*
  * `createdAt`

* **PostCategory** *(多对多，可选；若采用单分类可省略)*
  * `postId FK Post`
  * `categoryId FK Category`
  * `PRIMARY(postId, categoryId)`

* **PostTag**
  * `postId FK Post`
  * `tagId FK Tag`
  * `PRIMARY(postId, tagId)`

* **Page** *(单页/栏目页：区块化)*
  * `id PK`
  * `menuItemId FK MenuItem` *(关联到栏目，标识这个 Page 对应哪个"单页模块")*
  * `title`
  * `slug UNIQUE` *(如 "home" / "about" / "contact" / "solutions" / "support")*
  * `blocks JSON` *(区块数组，区块含 id/type/props/order/visibility)*
  * `status` *(draft | published)*
  * `publishedAt?`
  * `meta JSON?` *(SEO 元信息)*
  * `createdAt`
  * `updatedAt`

* **PageVersion** *(页面历史版本，v1.0 可选实现)*
  * `id PK`
  * `pageId FK Page`
  * `blocks JSON` *(快照)*
  * `createdBy FK User`
  * `createdAt`

### 6.4 媒体与表单

* **Media**
  * `id PK`
  * `filename`
  * `mime`
  * `size`
  * `width?` / `height?`
  * `alt?`
  * `storageKey` *(磁盘/S3 路径)*
  * `meta JSON?` *(EXIF/色域/来源)*
  * `createdAt`

* **FormSubmission** *(留言/咨询)*
  * `id PK`
  * `formCode` *(如 "contact")*
  * `payload JSON` *(姓名/邮箱/电话/内容等)*
  * `ip?` / `ua?` / `spamScore?`
  * `createdAt`

### 6.5 产品展示（仅展示）

* **Product**
  * `id PK`
  * `menuItemId FK MenuItem?` *(关联到栏目，标识属于哪个"产品模块")*
  * `name`
  * `slug UNIQUE`
  * `summary?`
  * `description JSON?` *(区块/富文本)*
  * `specs JSON?` *(键值对/表格)*
  * `gallery JSON?` *(图片数组，Media IDs)*
  * `price?` *(decimal，仅展示用)*
  * `categoryId FK Category?`
  * `tags JSON?` *(简单场景可直接保存标签数组；或用 `ProductTag`)*
  * `isActive` *(bool)*
  * `isFeatured` *(bool)*
  * `meta JSON?`
  * `createdAt`

> **索引建议**：
> * `Post.slug`、`Page.slug`、`Product.slug`：UNIQUE。
> * `Category.parentId, order`：联合索引。
> * `MenuItem.menuCode, parentId, order`：联合索引。
> * 常用检索字段（`Post.status,publishedAt` / `Product.isActive`）建立索引。
> * 搜索基于 LIKE 的情况下，为 `title/summary` 建立普通索引；若升级 FTS5 再增虚拟表与触发器（v2.0+ 再考虑）。

---

## 7. API 边界（只列资源与动作）

* **Auth**：注册/登录/刷新/修改密码。
* **Site**：读/改站点信息、主题变量、全局 SEO。
* **Media**：上传/列表/删除/替换/更新元信息。
* **Category/Tag**：CRUD。
* **MenuItem**（菜单/栏目）：
  * CRUD（包括 type、menuCode、parentId 等完整配置）
  * 树形结构查询（按 menuCode 过滤）
  * 排序调整（拖拽后批量更新 order）
  * **`GET /menu-items?menuCode=main`** - 获取主导航菜单（用于生成左侧"网站栏目"）
  * **`GET /menu-items/:id/content`** - 根据 type 返回对应的内容列表或编辑界面数据
* **Page**：
  * CRUD（包括 blocks JSON 的完整读写）
  * 草稿/发布切换
  * 预览草稿（临时链接）
  * 版本历史列表与回滚（可选）
  * **按 menuItemId 查询**（找到某个栏目对应的 Page）
* **Post**：
  * CRUD、草稿/发布、分类/标签管理
  * **按 menuItemId 查询**（找到某个栏目下的所有文章）
* **Product**：
  * CRUD、上/下架、置顶（featured）
  * **按 menuItemId 查询**（找到某个栏目下的所有产品）
* **Form**：提交表单（前台）、后台查看/导出。
* **Search**：`GET /search?q=` 返回统一搜索结果（分页）。
* **SEO**：`/sitemap.xml`、`/robots.txt`、`/seo/jsonld/:type/:slug`。
* **Blocks**：
  * `GET /blocks/types` - 获取所有可用区块类型及其配置 schema
  * `POST /blocks/validate` - 验证区块数据合法性

---

## 8. 非功能性需求（NFR）

* **SEO 可抓取性**：前台默认 **SSR/SSG**；发布变更触发**局部静态化**；生成 `sitemap.xml` 并提交至搜索引擎。
* **性能**：静态页命中 CDN；后台接口 P99 < 300ms（轻负载）；图片按需裁剪与 Web 优化（可后置到 v2.0）。
* **安全**：JWT 鉴权、RBAC、速率限制（登录/表单）、上传白名单与 MIME 校验。
* **稳定性**：单实例写 SQLite（WAL 模式），避免并发写冲突；日志与异常统一处理。
* **可运维**：Docker 部署；卷：`/data/app.db`、`/uploads`；每日快照备份；一键还原。
* **可扩展**：
  * 区块系统支持插件注册自定义区块类型
  * 路由中间件扩展点
  * 菜单项扩展点
  * v1.0 定义接口，不实现复杂插件管理

---

## 9. 验收标准（v1.0）

1. **动态栏目导航**：
   * 系统初始状态下，左侧"网站栏目"仅显示"首页"
   * 在菜单管理中添加栏目后，左侧导航立即同步显示
   * 支持多级栏目展开折叠

2. **栏目类型配置**：
   * 在菜单管理中可为每个栏目指定类型（单页/文章列表/产品模块）
   * 点击不同类型的栏目，显示对应的编辑界面
   * 单页模块打开区块编辑器，文章列表模块打开文章管理，产品模块打开产品管理

3. **内容编辑**：
   * 可通过后台完成：栏目/菜单搭建、创建 **首页（Page with Blocks）**、至少包含 3 种不同类型的区块、至少 2 篇 **文章（Post）**、至少 3 个 **产品（Product）**，前台正确渲染
   * 区块编辑器可拖拽排序、复制、删除区块，实时预览生效
   * 可上传图片并在页面/文章/产品/区块中显示，**alt** 可编辑

4. **搜索与 SEO**：
   * 搜索页可返回标题/摘要/正文命中结果（分页）
   * 自动生成 `sitemap.xml`、`robots.txt`，文章详情输出 JSON-LD（Article）

5. **表单与权限**：
   * 表单可提交，后台可查看与导出 CSV
   * 角色与审计：不同角色权限生效；发布/删除等操作写入审计日志

6. **备份还原**：
   * 拷贝 `app.db` + `/uploads` 至新环境能恢复完整站点

7. **区块渲染**：
   * 前台能正确渲染所有 v1.0 核心区块类型，样式符合主题设置

---

## 10. 版本路线

* **v1.0**：本文件所述全部能力（不含购买/预约/AI）。
* **v2.0**：
  * **AI**：通过外部 API 实现资料解析（PDF/图片→文本）与内容草稿生成；记录来源与生成参数；草稿人审后发布。
  * （可选）**购买/支付**：新增购物车/订单，先支持 **银行转账** 对账流程；
  * （可选）**预约**：时段/预订；
  * （可选）**FTS5** 全文检索、S3 兼容对象存储、多语言变体。
  * **自定义区块**：插件系统，允许注册第三方区块类型。
* **v3.0**：主题市场化、插件中心、PostgreSQL 适配与迁移脚本、监控与告警。

---

## 附录：区块系统技术实现建议

### A.1 后端实现要点

**区块类型注册**：
```typescript
// block-registry.service.ts
interface BlockDefinition {
  type: string;
  label: string;
  icon: string;
  category: string; // 'layout' | 'content' | 'media' | 'form'
  schema: JSONSchema; // 配置项的 JSON Schema
  defaultProps: object;
}

@Injectable()
class BlockRegistryService {
  private blocks: Map<string, BlockDefinition> = new Map();
  
  register(definition: BlockDefinition) {
    this.blocks.set(definition.type, definition);
  }
  
  getAll() {
    return Array.from(this.blocks.values());
  }
  
  validate(type: string, props: any): boolean {
    // 使用 JSON Schema 验证 props
  }
}
```

**Page API 增强**：
```typescript
// 保存时验证所有区块
async savePage(pageData) {
  for (const block of pageData.blocks) {
    if (!this.blockRegistry.validate(block.type, block.props)) {
      throw new BadRequestException(`Invalid block: ${block.type}`);
    }
  }
  // 保存到数据库
}
```

### A.2 前端实现要点

**区块组件注册**：
```typescript
// blocks/index.ts
import HeroBlock from './HeroBlock.vue'
import TextBlock from './TextBlock.vue'
// ...

export const blockComponents = {
  hero: HeroBlock,
  text: TextBlock,
  imageGallery: ImageGalleryBlock,
  // ...
}

// BlockRenderer.vue
<template>
  <component 
    v-for="block in blocks" 
    :key="block.id"
    :is="blockComponents[block.type]"
    v-bind="block.props"
  />
</template>
```

**区块编辑器**：
```vue
<!-- BlockEditor.vue -->
<template>
  <div class="block-editor">
    <div class="block-list">
      <draggable v-model="blocks" handle=".drag-handle">
        <div v-for="block in blocks" :key="block.id" class="block-item">
          <span class="drag-handle">⋮⋮</span>
          <span>{{ getBlockLabel(block.type) }}</span>
          <button @click="editBlock(block)">编辑</button>
          <button @click="deleteBlock(block.id)">删除</button>
        </div>
      </draggable>
      <button @click="showBlockPicker">+ 添加区块</button>
    </div>
    
    <div class="block-config-panel" v-if="currentBlock">
      <component 
        :is="getConfigComponent(currentBlock.type)"
        v-model="currentBlock.props"
      />
    </div>
  </div>
</template>
```

### A.3 前台渲染优化

**懒加载区块组件**：
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  components: [
    {
      path: '~/components/blocks',
      extensions: ['vue'],
      pathPrefix: false,
    }
  ]
})

// 使用时自动懒加载
<LazyHeroBlock v-if="block.type === 'hero'" :props="block.props" />
```

**主题变量注入**：
```vue
<script setup>
const { themeTokens } = useSite()
const cssVars = computed(() => ({
  '--primary-color': themeTokens.primaryColor,
  '--border-radius': themeTokens.borderRadius,
  // ...
}))
</script>

<template>
  <div :style="cssVars" class="page-container">
    <BlockRenderer :blocks="page.blocks" />
  </div>
</template>
```

---

### 备注

* 后台 UI 默认 **Naive UI**（更易品牌化与现代化风格），若团队成员偏好或沿用存量模板，可替换为 **Element Plus**，不影响后端与前台架构。
* 以上结构不含具体代码实现；若你需要，我可以在此 PRD 基础上输出**Prisma 模型草稿**与**API 路由清单**，以便直接交给开发团队或 AI 辅助工具生成代码。
* 区块系统设计为可扩展架构，v1.0 实现核心 12 种区块类型，v2.0 可通过插件机制扩展更多区块。
* **核心设计理念**：通过动态栏目导航和栏目类型配置，实现"所想即所见"的直觉式内容管理体验，让用户无需理解复杂的后台概念，即可完成网站内容的增删改查操作。