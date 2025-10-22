# Docms API

基于 NestJS 的现代 CMS 后端 API，采用 TDD (测试驱动开发) 模式构建。

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 环境配置
```bash
# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，设置你的配置
vim .env
```

### 数据库设置
```bash
# 生成 Prisma 客户端
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate

# 插入种子数据
npm run prisma:seed
```

### 启动开发服务器
```bash
npm run start:dev
```

API 将在 http://localhost:3000 启动

## 📚 API 文档
- **Swagger UI**: http://localhost:3000/api/docs
- **交互式文档**: 完整的 OpenAPI 3.0 规范

## 🧪 开发命令
```bash
# 开发模式（热重载）
npm run start:dev

# 生产构建
npm run build

# 运行测试
npm run test

# 测试覆盖率
npm run test:cov

# 代码格式化
npm run format

# 代码检查
npm run lint

# 类型检查
npm run typecheck
```

## 🏗️ 项目结构
```
src/
├── auth/                 # 用户认证模块 ✅
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   └── dto/
├── common/               # 公共模块 ✅
│   ├── guards/          # 权限守卫
│   ├── decorators/       # 权限装饰器
│   ├── services/        # 权限服务
│   ├── controllers/     # 权限控制器
│   └── module.ts
├── app.module.ts         # 主应用模块
├── app.controller.ts      # 健康检查控制器
├── app.service.ts         # 应用服务
└── main.ts              # 应用入口
```

## 🔐 已实现功能

### ✅ 用户认证 (TDD 完成)
- 用户注册（邮箱验证、密码强度）
- 用户登录（凭证验证、JWT 生成）
- Token 刷新机制
- 密码重置（随机密码生成）
- JWT 策略和守卫
- 完整的 DTO 验证

### ✅ 权限管理 (TDD 完成)
- 基于角色的访问控制 (RBAC)
- 5 级角色层次：VIEWER < AUTHOR < EDITOR < ADMIN < OWNER
- 权限装饰器 `@Roles()`
- 权限守卫 `RolesGuard`
- 权限检查服务 `PermissionsService`
- 角色权限 API 端点

### 🔒 安全特性
- bcrypt 密码哈希
- JWT 双令牌机制
- 输入验证和清理
- CORS 配置
- 错误处理和日志

### 📊 测试覆盖率
- 单元测试：100% 核心功能覆盖
- 集成测试：进行中
- TDD 开发流程：先写测试 → 实现代码 → 重构

## 📋 下一步计划

按照 TDD 流程，下一模块：
1. **站点管理模块** - 站点配置和主题设置
2. **媒体管理模块** - 文件上传和管理
3. **菜单管理模块** - 动态导航生成
4. **页面管理模块** - Block-based 页面系统
5. **内容管理模块** - 文章和产品管理

## 🤖 贡献指南
1. 遵循 TDD 开发模式
2. 保持 100% 测试覆盖率
3. 编写清晰的文档和注释
4. 遵循代码规范和最佳实践

---

**开发状态**: v1.0 核心模块开发中
**技术支持**: 查看 [DEVELOPMENT_PROGRESS.md](./DEVELOPMENT_PROGRESS.md)
**API 文档**: 查看 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)