# 首页功能诊断报告

## 问题概述

首页可以访问，但区块内容未显示。经诊断发现**关键问题：区块类型名称不匹配**。

## 当前状态

### ✅ 正常运行的部分
1. Website服务器正常运行（http://localhost:3002）
2. API连接正常（无404错误）
3. 首页数据成功从数据库获取
4. BlockRenderer组件正常加载
5. 3个区块的容器都已渲染（有aria-label）

### ❌ 发现的问题

**区块类型名称不匹配**

**数据库中的类型**（从API `/pages/by-slug/home` 返回）：
```json
{
  "blocks": [
    {"id": "hero-1", "type": "HERO", ...},
    {"id": "features-1", "type": "FEATURES", ...},
    {"id": "product-showcase-1", "type": "PRODUCT_SHOWCASE", ...}
  ]
}
```

**前端代码期望的类型**（`website/types/index.ts`）：
```typescript
export type BlockType =
  | 'hero'           // ❌ 数据库返回 "HERO"
  | 'features'       // ❌ 数据库返回 "FEATURES"
  | 'productShowcase' // ❌ 数据库返回 "PRODUCT_SHOWCASE"
  | ...
```

**BlockRenderer.vue 中的映射**：
```typescript
const blockComponents: Record<BlockType, any> = {
  hero: HeroBlock,              // 期望 "hero"，收到 "HERO"
  features: FeaturesBlock,      // 期望 "features"，收到 "FEATURES"
  productShowcase: ProductShowcaseBlock, // 期望 "productShowcase"，收到 "PRODUCT_SHOWCASE"
  ...
}
```

### 页面显示情况

从Chrome DevTools快照和截图可以看到：

**显示的内容**：
- ✅ Header: "Docms" 显示正常
- ✅ Footer: 快速链接、联系我们、关注我们、版权信息 - 都显示正常
- ✅ 3个区块容器已渲染（从aria-label可见）：
  - "让每个家庭都拥有自己的智能农场"
  - "为什么选择水培?"
  - "热门产品"

**未显示的内容**：
- ❌ Hero区块的subtitle、背景图、CTA按钮
- ❌ Features区块的4个特性卡片
- ❌ ProductShowcase区块的产品列表

**原因**：由于类型不匹配，`getBlockComponent()` 函数返回默认的 `TextBlock`，但 `TextBlock` 无法正确渲染 Hero/Features/ProductShowcase 的数据结构。

## 数据库中的完整首页数据

```json
{
  "id": "cmh65xqac000tm77sj8zxev0s",
  "title": "首页 - 绿野水培",
  "slug": "home",
  "blocks": [
    {
      "id": "hero-1",
      "type": "HERO",
      "order": 1,
      "visibility": true,
      "props": {
        "title": "让每个家庭都拥有自己的智能农场",
        "subtitle": "专业水培设备 · 15年技术积累 · 10万+用户的选择",
        "backgroundImage": "/uploads/hero-bg.jpg",
        "ctaText": "查看产品",
        "ctaLink": "/products"
      }
    },
    {
      "id": "features-1",
      "type": "FEATURES",
      "order": 2,
      "visibility": true,
      "props": {
        "title": "为什么选择水培?",
        "features": [
          {
            "icon": "water-drop",
            "title": "节水90%",
            "description": "循环利用营养液,比土培节水90%以上"
          },
          {
            "icon": "growth",
            "title": "生长快30%",
            "description": "营养精准控制,生长速度提升30%"
          },
          {
            "icon": "clean",
            "title": "零农药",
            "description": "室内种植,无病虫害,不需要农药"
          },
          {
            "icon": "automation",
            "title": "全自动",
            "description": "智能控制系统,手机APP远程管理"
          }
        ]
      }
    },
    {
      "id": "product-showcase-1",
      "type": "PRODUCT_SHOWCASE",
      "order": 3,
      "visibility": true,
      "props": {
        "title": "热门产品",
        "displayMode": "featured"
      }
    }
  ],
  "meta": {
    "title": "绿野水培 - 专业水培设备供应商 | 智能家庭农场解决方案",
    "description": "专注水培技术15年,提供家庭/商业水培系统、智能种植设备,一站式水培解决方案",
    "keywords": ["水培设备", "智能种植", "家庭农场", "垂直农场", "无土栽培"]
  }
}
```

## 解决方案

### 方案 1: 修改API序列化（推荐）
在API层面将区块类型转换为小驼峰命名：
```typescript
// api/src/pages/pages.service.ts
const transformBlockType = (type: string): string => {
  const mapping = {
    'HERO': 'hero',
    'TEXT': 'text',
    'IMAGE_GALLERY': 'imageGallery',
    'FEATURES': 'features',
    'CTA': 'cta',
    'FAQ': 'faq',
    'PRODUCT_SHOWCASE': 'productShowcase',
    'TESTIMONIALS': 'testimonials',
    'CONTACT_FORM': 'contactForm',
    'MAP': 'map',
    'VIDEO': 'video',
    'DIVIDER': 'divider',
  }
  return mapping[type] || type.toLowerCase()
}
```

### 方案 2: 修改前端类型定义
修改 `website/types/index.ts` 使用大写类型：
```typescript
export type BlockType =
  | 'HERO'
  | 'TEXT'
  | 'IMAGE_GALLERY'
  // ...
```
同时修改 BlockRenderer.vue 的映射。

### 方案 3: 在BlockRenderer中添加类型转换（快速修复）
在 `BlockRenderer.vue` 中添加类型转换逻辑：
```typescript
const normalizeBlockType = (type: string): BlockType => {
  const mapping: Record<string, BlockType> = {
    'HERO': 'hero',
    'FEATURES': 'features',
    'PRODUCT_SHOWCASE': 'productShowcase',
    // ...
  }
  return mapping[type] || type.toLowerCase() as BlockType
}
```

## 推荐行动

1. **立即修复**（方案3）- 在BlockRenderer中添加类型转换，让首页立即显示
2. **长期优化**（方案1）- 统一API返回的数据格式，避免前后端类型不一致

## 预期修复后的效果

修复后，首页应该显示：
1. ✅ Hero区块 - 大标题、副标题、背景图、"查看产品"按钮
2. ✅ Features区块 - 4个特性卡片（节水90%、生长快30%、零农药、全自动）
3. ✅ ProductShowcase区块 - 热门产品展示

---
**诊断时间**: 2025-10-26
**问题严重程度**: 中 - 功能性问题，不影响站点运行但影响内容显示
**修复优先级**: 高
