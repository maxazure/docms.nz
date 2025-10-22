# Admin 前端 API 集成配置说明

## API 路径配置 ✅

### 后端 API 结构
后端 API 位于 `api/` 目录，运行在 `http://localhost:3000`

**API 路由结构**：
```
http://localhost:3000/
├── /auth/*          - 认证相关接口
├── /menu-items/*    - 菜单管理接口
├── /pages/*         - 页面管理接口
├── /posts/*         - 文章管理接口
├── /products/*      - 产品管理接口
├── /media/*         - 媒体库接口
├── /categories/*    - 分类管理接口
├── /tags/*          - 标签管理接口
├── /forms/*         - 表单管理接口
├── /site/*          - 站点设置接口
├── /users/*         - 用户管理接口
├── /search/*        - 搜索接口
└── /blocks/*        - 区块类型接口
```

## 前端配置

### 1. 环境变量配置

#### `.env.development` (开发环境)
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=Docms 管理后台
```

#### `.env.production` (生产环境)
```bash
VITE_API_BASE_URL=
VITE_APP_TITLE=Docms 管理后台
```

> **注意**: 生产环境 `VITE_API_BASE_URL` 为空，表示使用相对路径，需要通过 Nginx 等反向代理配置。

### 2. Vite 代理配置

`vite.config.ts` 中已配置所有 API 路径的代理：

```typescript
server: {
  port: 5173,
  proxy: {
    '/auth': { target: 'http://localhost:3000', changeOrigin: true },
    '/menu-items': { target: 'http://localhost:3000', changeOrigin: true },
    '/pages': { target: 'http://localhost:3000', changeOrigin: true },
    // ... 其他路径
  }
}
```

### 3. HTTP 客户端配置

`src/utils/request.ts`:
- **baseURL**: 从环境变量读取，默认为空字符串
- **timeout**: 15 秒
- **自动添加 JWT Token**: 请求拦截器自动从 localStorage 读取
- **自动刷新 Token**: 401 时自动调用 `/auth/refresh`
- **自动跳转登录**: Token 刷新失败时跳转到 `/login`

### 4. API 服务层

#### 认证 API (`src/api/auth.ts`)
```typescript
authApi.login(data)           // POST /auth/login
authApi.register(data)        // POST /auth/register
authApi.refreshToken(data)    // POST /auth/refresh
authApi.logout()              // POST /auth/logout
authApi.getProfile()          // GET /auth/profile
authApi.resetPassword(email)  // POST /auth/reset-password
```

#### 菜单 API (`src/api/menu.ts`)
```typescript
menuApi.getMenuItems(menuCode?)     // GET /menu-items?menuCode=xxx
menuApi.getMenuItem(id)             // GET /menu-items/:id
menuApi.createMenuItem(data)        // POST /menu-items
menuApi.updateMenuItem(id, data)    // PUT /menu-items/:id
menuApi.deleteMenuItem(id)          // DELETE /menu-items/:id
menuApi.updateMenuOrder(items)      // PATCH /menu-items/order
```

## 请求示例

### 登录请求
```typescript
import { authApi } from '@/api'

const result = await authApi.login({
  email: 'admin@example.com',
  password: 'password123'
})

if (result.success) {
  console.log('登录成功', result.data)
  // result.data: { accessToken, refreshToken, user }
}
```

### 获取菜单
```typescript
import { menuApi } from '@/api'

// 获取主导航菜单
const result = await menuApi.getMainMenuItems()
if (result.success) {
  console.log('菜单数据', result.data)
}
```

## API 响应格式

### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 响应数据
  }
}
```

### 错误响应
```json
{
  "success": false,
  "message": "错误信息",
  "error": "错误详情"
}
```

## 认证流程

1. **登录**:
   - 调用 `POST /auth/login`
   - 获取 `accessToken` 和 `refreshToken`
   - 保存到 `localStorage`

2. **请求 API**:
   - 请求拦截器自动添加 `Authorization: Bearer <accessToken>` 头

3. **Token 过期**:
   - 后端返回 401
   - 响应拦截器自动调用 `/auth/refresh`
   - 刷新成功：保存新 token，重试原请求
   - 刷新失败：清除 token，跳转登录页

4. **退出登录**:
   - 调用 `POST /auth/logout`
   - 清除 `localStorage` 中的 token

## 开发调试

### 启动后端 API
```bash
cd api
npm run start:dev
```
后端运行在: `http://localhost:3000`

### 启动前端
```bash
cd admin
npm run dev
```
前端运行在: `http://localhost:5173`

### 测试 API 连接
1. 打开浏览器访问 `http://localhost:5173`
2. 打开开发者工具 Network 标签
3. 尝试登录，查看请求是否正确代理到后端

## 生产环境部署

### Nginx 反向代理配置示例
```nginx
server {
  listen 80;
  server_name your-domain.com;

  # 前端静态文件
  location / {
    root /var/www/docms/admin/dist;
    try_files $uri $uri/ /index.html;
  }

  # API 代理
  location ~ ^/(auth|menu-items|pages|posts|products|media|categories|tags|forms|site|users|search|blocks) {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## 注意事项

1. **CORS**: 开发环境通过 Vite proxy 解决，生产环境需要后端配置 CORS 或使用 Nginx
2. **Token 存储**: 目前使用 `localStorage`，可根据安全需求改为 `httpOnly cookie`
3. **请求超时**: 默认 15 秒，可在 `request.ts` 中调整
4. **错误处理**: 所有 API 调用都应该 try-catch 处理错误

## API 开发状态

### ✅ 已实现的 API
- POST `/auth/register` - 用户注册
- POST `/auth/login` - 用户登录
- POST `/auth/refresh` - 刷新 Token
- POST `/auth/logout` - 退出登录
- GET `/auth/profile` - 获取用户信息
- POST `/auth/reset-password` - 重置密码

### ⏳ 待实现的 API
参考后端 `api/` 目录中的控制器和服务实现状态。

---

**最后更新**: 2025-10-23 00:01  
**配置状态**: ✅ 已完成并测试
