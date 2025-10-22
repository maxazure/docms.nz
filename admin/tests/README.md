# Docms Admin 测试文档

## 测试概述

本项目使用 **Vitest** + **Vue Test Utils** 进行单元测试和组件测试，遵循 TDD (Test-Driven Development) 开发实践。

## 测试结构

```
tests/
├── setup.ts                    # 测试环境配置
├── utils/
│   └── test-utils.ts          # 测试工具函数
├── stores/                     # Store 单元测试
│   ├── auth.spec.ts
│   ├── menu.spec.ts
│   └── app.spec.ts
├── components/                 # 组件测试
│   └── layout/
│       ├── AppSidebar.spec.ts
│       └── AppLayout.spec.ts
├── views/                      # 视图组件测试
│   └── auth/
│       └── Login.spec.ts
└── router/                     # 路由集成测试
    └── navigation.spec.ts
```

## 运行测试

### 安装依赖

```bash
npm install
```

### 运行所有测试

```bash
npm test
```

### 运行测试并生成覆盖率报告

```bash
npm run test:coverage
```

### 运行测试 UI 界面

```bash
npm run test:ui
```

### 监听模式（开发时推荐）

```bash
npm test -- --watch
```

### 运行特定测试文件

```bash
npm test -- auth.spec.ts
```

## 测试工具函数

### `createTestPinia()`

创建一个干净的 Pinia 实例用于测试。

```typescript
import { createTestPinia } from '../utils/test-utils'

beforeEach(() => {
  createTestPinia()
})
```

### `createTestRouter(routes)`

创建一个带有 memory history 的测试路由器。

```typescript
import { createTestRouter } from '../utils/test-utils'

const router = createTestRouter([
  { path: '/', component: Home }
])
```

### `mountWithProviders(component, options)`

挂载组件并自动提供常用的依赖（Pinia, Router 等）。

```typescript
import { mountWithProviders } from '../utils/test-utils'

const wrapper = mountWithProviders(MyComponent, {
  props: { foo: 'bar' },
  router: customRouter
})
```

### `flushPromises()`

等待所有异步操作完成。

```typescript
import { flushPromises } from '../utils/test-utils'

await flushPromises()
```

### `mockApiResponse<T>(data, success)`

创建模拟的 API 响应。

```typescript
import { mockApiResponse } from '../utils/test-utils'

const mockResponse = mockApiResponse({ id: 1, name: 'Test' })
```

## 测试覆盖范围

### ✅ 已完成的测试

1. **Store 单元测试**
   - Auth Store: 登录、登出、获取用户信息、刷新令牌
   - Menu Store: 获取菜单、构建树形结构、菜单查找
   - App Store: 侧边栏状态、主题切换、加载条

2. **组件测试**
   - Login 组件: 表单验证、登录流程、错误处理
   - AppSidebar: 菜单渲染、路由生成、折叠状态
   - AppLayout: 布局结构、缓存视图

3. **路由集成测试**
   - 路由守卫: 认证检查、重定向逻辑
   - 导航流程: 登录后跳转、根路径重定向

### 🚧 待补充的测试

- AppHeader 组件测试
- Dashboard 视图测试
- API 请求拦截器测试
- 媒体库组件测试（开发后补充）
- 区块编辑器组件测试（开发后补充）

## 编写测试的最佳实践

### 1. 测试结构

使用 `describe` 和 `it` 组织测试：

```typescript
describe('ComponentName', () => {
  describe('Feature/Method', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

### 2. 测试隔离

每个测试应该是独立的，使用 `beforeEach` 重置状态：

```typescript
beforeEach(() => {
  createTestPinia()
  localStorage.clear()
  vi.clearAllMocks()
})
```

### 3. Mock 外部依赖

使用 Vitest 的 `vi.mock` 模拟 API 调用：

```typescript
vi.mock('@/api/auth', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn()
  }
}))
```

### 4. 测试用户交互

模拟用户操作：

```typescript
const button = wrapper.find('button')
await button.trigger('click')

const input = wrapper.find('input')
await input.setValue('test value')
```

### 5. 异步测试

正确处理异步操作：

```typescript
it('should handle async operation', async () => {
  await someAsyncAction()
  await flushPromises()

  expect(result).toBe(expected)
})
```

## TDD 开发流程

1. **红灯（Red）**: 先写测试，运行失败
2. **绿灯（Green）**: 编写最少代码使测试通过
3. **重构（Refactor）**: 优化代码，确保测试仍然通过

### 示例流程

```bash
# 1. 编写测试
npm test -- --watch MyComponent.spec.ts

# 2. 观察测试失败
# 3. 实现功能代码
# 4. 观察测试通过
# 5. 重构代码
# 6. 确认测试仍然通过
```

## 测试覆盖率目标

- **整体覆盖率**: > 80%
- **关键模块**:
  - Stores: > 90%
  - 认证流程: 100%
  - 路由守卫: 100%
  - 核心组件: > 85%

## 持续集成

测试应该在 CI/CD 流水线中自动运行：

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## 调试测试

### 使用 Vitest UI

```bash
npm run test:ui
```

在浏览器中查看测试结果、覆盖率和调试信息。

### 使用 VS Code 调试

在 `launch.json` 中添加配置：

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test", "--", "--run"],
  "console": "integratedTerminal"
}
```

## 参考资源

- [Vitest 文档](https://vitest.dev/)
- [Vue Test Utils 文档](https://test-utils.vuejs.org/)
- [Testing Library 最佳实践](https://testing-library.com/docs/guiding-principles)
