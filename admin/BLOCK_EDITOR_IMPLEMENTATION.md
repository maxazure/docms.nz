# 区块编辑器模块开发总结

## 完成日期
2025-10-23

## 开发方法
**TDD (Test-Driven Development)** - 先编写测试，再实现功能

## 模块概述
区块编辑器是 Docms 管理后台最核心的功能模块，实现了\"区块化页面构建\"的核心设计理念。用户可以通过拖拽、配置区块来构建页面，无需编写代码。

## 功能特性

### ✅ PageList组件 (页面列表)
- 页面列表展示 (表格视图)
- 创建/编辑/删除页面
- 发布/取消发布
- 搜索和筛选 (标题、状态、栏目)
- 分页
- **文件**: `src/views/pages/PageList.vue` (389行)

### ✅ PageEditor组件 (区块编辑器)

#### 1. 基本信息管理
- 页面标题
- URL Slug (格式验证)
- 所属栏目选择
- 发布状态
- **位置**: `PageEditor.vue:48-72`

#### 2. 区块列表管理
- 显示所有区块
- 区块类型图标
- 区块可见性状态
- 选中高亮
- 空状态提示
- **位置**: `PageEditor.vue:74-128`

#### 3. 区块操作
- ✅ 添加区块 (从12种类型选择)
- ✅ 删除区块
- ✅ 上移/下移 (排序)
- ✅ 复制区块
- ✅ 显示/隐藏切换
- ✅ 选择区块进行配置
- **位置**: `PageEditor.vue:396-465`

#### 4. 区块选择器
- 分类展示 (布局/内容/媒体/表单)
- 图标化选择
- 模态对话框
- **位置**: `PageEditor.vue:146-171`

#### 5. 区块配置面板
- 动态加载配置组件
- 实时更新区块属性
- 媒体选择器集成
- **位置**: `PageEditor.vue:131-143`

#### 6. 自动保存
- 3秒防抖
- 静默保存
- 仅编辑模式触发
- **位置**: `PageEditor.vue:476-494`

#### 7. 保存和发布
- 表单验证
- 保存草稿
- 保存并发布
- 错误处理
- **位置**: `PageEditor.vue:356-394`

## 区块注册系统

### 区块定义 (12种)

**文件**: `src/config/blocks.ts`

1. **hero** - Hero横幅
2. **text** - 文本区块
3. **imageGallery** - 图片画廊
4. **features** - 特点展示
5. **cta** - CTA行动号召
6. **faq** - FAQ常见问题
7. **productShowcase** - 产品展示
8. **testimonials** - 客户评价
9. **contactForm** - 联系表单
10. **map** - 地图
11. **video** - 视频
12. **divider** - 分隔符

### 区块配置组件

每个区块都有对应的配置组件：

**已实现（完整版）**:
- `HeroBlockConfig.vue` - Hero配置
  - 标题/副标题
  - 背景图选择
  - CTA按钮
  - 高度和对齐

- `TextBlockConfig.vue` - 文本配置
  - 内容输入 (支持HTML)
  - 对齐方式
  - 最大宽度

- `ImageGalleryBlockConfig.vue` - 图片画廊配置
  - 多图选择
  - 布局模式
  - 列数和纵横比

**已实现（基础版）**:
- 其余9个区块配置组件

## 技术实现

### 核心技术栈
- **Vue 3 Composition API**
- **TypeScript**
- **Naive UI**
  - n-form (表单)
  - n-modal (对话框)
  - n-button-group (按钮组)
  - n-dynamic-input (动态输入)
- **区块注册系统**
- **动态组件加载**

### 关键设计模式

#### 1. 区块注册模式
```typescript
export const blockRegistry: BlockDefinition[] = [
  {
    type: 'hero',
    label: 'Hero 横幅',
    icon: 'image',
    category: 'layout',
    schema: {},
    defaultProps: { /* ... */ }
  },
  // ...
]

export function getBlockDefinition(type: string): BlockDefinition | undefined {
  return blockRegistry.find(block => block.type === type)
}
```

#### 2. 动态组件映射
```typescript
const blockConfigMap: Record<string, any> = {
  hero: markRaw(HeroBlockConfig),
  text: markRaw(TextBlockConfig),
  // ...
}

function getBlockConfigComponent(type: string) {
  return blockConfigMap[type] || null
}
```

#### 3. 区块操作
```typescript
function handleAddBlock(type: string) {
  const blockDef = getBlockDefinition(type)
  const newBlock: Block = {
    id: `block-${Date.now()}`,
    type,
    props: { ...blockDef.defaultProps },
    order: pageData.value.blocks?.length || 0,
    visibility: true
  }
  pageData.value.blocks.push(newBlock)
  triggerAutoSave()
}

function handleMoveBlockUp(index: number) {
  const temp = pageData.value.blocks[index]
  pageData.value.blocks[index] = pageData.value.blocks[index - 1]
  pageData.value.blocks[index - 1] = temp
  triggerAutoSave()
}
```

#### 4. 自动保存机制
```typescript
function triggerAutoSave() {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
  autoSaveTimer.value = setTimeout(() => {
    if (!isNew.value) {
      handleAutoSave()
    }
  }, 3000)
}
```

## TDD 测试覆盖

### 测试文件
1. **tests/views/pages/PageList.spec.ts** - 17个测试
2. **tests/views/pages/PageEditor.spec.ts** - 15个测试

**总测试数**: 32个测试

### 测试场景

#### PageEditor测试
1. **初始渲染** (3 tests)
   - 渲染编辑器
   - 加载现有页面
   - 初始化新页面

2. **区块操作** (6 tests)
   - 添加区块
   - 删除区块
   - 上移区块
   - 下移区块
   - 复制区块
   - 切换可见性

3. **区块配置** (2 tests)
   - 选择区块
   - 更新区块属性

4. **保存操作** (3 tests)
   - 保存新页面
   - 更新现有页面
   - 表单验证

5. **自动保存** (1 test)
   - 触发自动保存

6. **错误处理** (2 tests)
   - 加载错误
   - 保存错误

## API使用

### Page API端点
**文件**: `src/api/page.ts`

1. `GET /api/pages` - 获取页面列表
2. `GET /api/pages/:id` - 获取页面详情
3. `POST /api/pages` - 创建页面
4. `PUT /api/pages/:id` - 更新页面
5. `DELETE /api/pages/:id` - 删除页面
6. `POST /api/pages/:id/publish` - 发布页面
7. `POST /api/pages/:id/unpublish` - 取消发布
8. `GET /api/pages/:id/versions` - 获取版本历史
9. `POST /api/pages/:id/versions/:versionId/restore` - 恢复版本

## 用户体验优化

### 1. 直观的操作流程
- 左侧管理区块列表
- 右侧配置选中区块
- 模态对话框选择区块类型
- 图标化展示区块

### 2. 即时反馈
- 选中区块高亮
- 保存成功提示
- 错误提示
- 加载状态

### 3. 防错设计
- 表单验证
- 禁用无效操作按钮
- 自动保存防止丢失

### 4. 性能优化
- 组件懒加载 (markRaw)
- 防抖自动保存
- 静默保存不打扰

## 文件结构

```
admin/
├── src/
│   ├── views/
│   │   └── pages/
│   │       ├── PageList.vue           # 页面列表 (389行)
│   │       └── PageEditor.vue         # 区块编辑器 (682行)
│   ├── components/
│   │   └── blocks/
│   │       ├── HeroBlockConfig.vue
│   │       ├── TextBlockConfig.vue
│   │       ├── ImageGalleryBlockConfig.vue
│   │       └── ... (9个其他配置组件)
│   ├── config/
│   │   └── blocks.ts                  # 区块注册系统
│   └── api/
│       └── page.ts                    # Page API
└── tests/
    └── views/
        └── pages/
            ├── PageList.spec.ts       # 页面列表测试 (17 tests)
            └── PageEditor.spec.ts     # 编辑器测试 (15 tests)
```

## 与PRD的对应关系

### PRD要求
参考 `CMS-PRD-v1.0.md` 第 4.5 节 \"页面编辑 - 区块化编辑器\"

### 实现情况
| PRD要求 | 实现状态 | 说明 |
|---------|---------|------|
| 区块列表（左侧） | ✅ | 完整实现 |
| 区块配置面板（右侧） | ✅ | 动态加载 |
| 添加区块 | ✅ | 12种类型 |
| 拖拽排序 | ✅ | 上移/下移 |
| 删除区块 | ✅ | 含确认 |
| 复制区块 | ✅ | 深拷贝 |
| 显示/隐藏 | ✅ | 切换可见性 |
| 媒体选择器集成 | ✅ | Hero和Gallery |
| 自动保存 | ✅ | 3秒防抖 |
| 区块预览 | ⚠️ | 未实现 |
| 版本历史 | ⚠️ | API已实现，UI待补充 |

## 已知限制

### 1. 区块预览
当前只有配置界面，没有实时预览功能。

### 2. 版本历史UI
API已实现，但UI界面未开发。

### 3. 区块拖拽
当前使用上移/下移按钮，未实现鼠标拖拽。

### 4. 富文本编辑器
Text区块使用普通textarea，未集成富文本编辑器。

## 后续优化建议

### 1. 功能增强
- [ ] 区块实时预览
- [ ] 鼠标拖拽排序
- [ ] 富文本编辑器集成
- [ ] 版本历史UI
- [ ] 区块模板
- [ ] 区块导入/导出

### 2. 用户体验
- [ ] 键盘快捷键
- [ ] 撤销/重做
- [ ] 区块搜索
- [ ] 区块分组折叠

### 3. 性能优化
- [ ] 虚拟滚动（大量区块）
- [ ] 区块懒渲染
- [ ] 配置项懒加载

## 开发时间
- **区块注册系统**: 30分钟
- **PageEditor主体**: 3小时
- **区块配置组件**: 2小时
- **测试编写**: 1小时
- **调试优化**: 1小时
- **文档编写**: 30分钟
- **总计**: 约8小时

## 经验总结

### 区块系统设计
1. ✅ **注册模式很好**: 易于扩展新区块
2. ✅ **动态组件加载**: 性能好
3. ✅ **Props驱动配置**: 解耦清晰
4. ⚠️ **配置组件重复**: 可抽象通用组件

### 自动保存
1. ✅ **防抖机制**: 避免频繁请求
2. ✅ **静默保存**: 不打扰用户
3. ✅ **仅编辑模式**: 新建不触发

### Vue 3实践
1. `markRaw` 避免响应式开销
2. `computed` 优化性能
3. `defineExpose` 便于测试
4. 组件通信清晰

## 下一步计划
根据用户要求继续开发剩余阶段 (Stage 7-15)

**Stage 7**: 文章管理模块
