# Docms API 文档

## 项目信息
- **版本**: v1.0
- **技术栈**: NestJS + Prisma + SQLite + JWT + Swagger
- **开发模式**: TDD (测试驱动开发)

---

## 已实现 API 端点

### 🔐 认证模块 (Authentication)

#### POST `/auth/register`
**功能**: 用户注册
**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "用户名"
}
```
**响应**:
```json
{
  "success": true,
  "message": "用户注册成功",
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "displayName": "用户名",
    "role": "VIEWER"
  }
}
```

#### POST `/auth/login`
**功能**: 用户登录
**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**响应**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "displayName": "用户名",
      "role": "OWNER"
    }
  }
}
```

#### POST `/auth/refresh`
**功能**: 刷新访问令牌
**请求体**:
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

#### POST `/auth/reset-password`
**功能**: 重置密码
**请求体**:
```json
{
  "email": "user@example.com"
}
```

#### POST `/auth/logout`
**功能**: 用户退出登录
**认证**: 需要 Bearer Token

#### GET `/auth/profile`
**功能**: 获取用户信息
**认证**: 需要 Bearer Token

---

### 🛡️ 权限管理模块 (Permissions & RBAC)

#### GET `/api/permissions`
**功能**: 获取所有角色信息
**响应**:
```json
{
  "success": true,
  "data": [
    {
      "role": "VIEWER",
      "level": 1,
      "description": "访客 - 只能查看内容"
    },
    {
      "role": "AUTHOR",
      "level": 2,
      "description": "作者 - 可以创建和编辑自己的内容"
    },
    {
      "role": "EDITOR",
      "level": 3,
      "description": "编辑 - 可以编辑所有内容和发布"
    },
    {
      "role": "ADMIN",
      "level": 4,
      "description": "管理员 - 可以管理用户、内容和设置"
    },
    {
      "role": "OWNER",
      "level": 5,
      "description": "所有者 - 拥有所有权限"
    }
  ]
}
```

#### GET `/api/permissions/hierarchy`
**功能**: 获取角色层次结构和权限矩阵
**响应**: 包含完整的权限分配矩阵

---

### 🔍 应用程序信息

#### GET `/`
**功能**: 健康检查
**响应**:
```json
{
  "status": "ok",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "service": "docms-api",
  "version": "1.0.0"
}
```

#### GET `/api`
**功能**: 获取API信息
**响应**:
```json
{
  "name": "Docms API",
  "version": "1.0.0",
  "description": "Docms Backend API - A modern, block-based CMS",
  "documentation": "/api/docs",
  "endpoints": {
    "health": "/",
    "apiInfo": "/api",
    "auth": "/api/auth",
    "users": "/api/users",
    "site": "/api/site",
    "media": "/api/media",
    "menu": "/api/menu",
    "pages": "/api/pages",
    "posts": "/api/posts",
    "products": "/api/products",
    "forms": "/api/forms",
    "search": "/api/search",
    "seo": "/api/seo",
    "blocks": "/api/blocks"
  }
}
```

---

## 🔐 认证和权限

### JWT Token 格式
- **Header**: `Authorization: Bearer <access_token>`
- **Payload**:
```json
{
  "userId": "user-id",
  "email": "user@example.com",
  "role": "OWNER"
}
```

### 权限装饰器使用
```typescript
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

// 单一权限要求
@Roles('ADMIN')
@Post('/admin/users')
async adminMethod() {
  // 只有 ADMIN 或更高级别角色可以访问
}

// 多权限要求
@Roles('EDITOR', 'ADMIN')
@Put('/content/:id')
async editContent() {
  // EDITOR 或 ADMIN 或 OWNER 可以访问
}

// 公开端点（无需权限）
@Roles()
@Get('/public-info')
async getPublicInfo() {
  // 所有用户都可以访问
}
```

### 角色定义
```typescript
export enum UserRole {
  VIEWER = 'VIEWER',    // 访客：只能查看内容
  AUTHOR = 'AUTHOR',    // 作者：可以创建和编辑自己的内容
  EDITOR = 'EDITOR',    // 编辑：可以编辑所有内容和发布
  ADMIN = 'ADMIN',      // 管理员：可以管理用户、内容和设置
  OWNER = 'OWNER',      // 所有者：拥有所有权限
}
```

---

## 🔧 开发和部署

### 环境变量
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 数据库迁移
```bash
npm run prisma:generate    # 生成 Prisma 客户端
npm run prisma:migrate      # 运行数据库迁移
npm run prisma:seed         # 插入种子数据
npm run prisma:studio       # 打开数据库可视化工具
```

### 开发命令
```bash
npm run start:dev          # 开发模式启动
npm run build             # 构建生产版本
npm run test              # 运行测试
npm run test:cov          # 运行测试并生成覆盖率报告
```

### API 文档
- **Swagger UI**: http://localhost:3000/api/docs
- **交互式文档**: 完整的 OpenAPI 3.0 规范
- **示例**: 所有端点都包含请求/响应示例

---

## 📊 当前状态

### ✅ 已实现
- [x] 认证模块 (100%)
- [x] 权限管理模块 (100%)
- [x] 基础应用框架 (100%)

### 🔄 开发中
- [ ] 站点管理模块
- [ ] 媒体管理模块
- [ ] 菜单管理模块
- [ ] 页面管理模块 (Block-based)
- [ ] 文章管理模块
- [ ] 产品管理模块
- [ ] 表单管理模块
- [ ] 搜索功能模块
- [ ] SEO 功能模块
- [ ] 区块系统模块

### 📈 测试覆盖率
- **单元测试**: 100% 核心功能
- **集成测试**: 进行中
- **端到端测试**: 计划中

---

*最后更新: 2025-01-22*
*文档版本: v1.0*