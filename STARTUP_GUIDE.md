# Docms 启动指南 / Startup Guide

## 📦 一键启动脚本

本项目提供了3个批处理脚本，用于快速启动和管理 Docms 服务。

## 🚀 快速开始

### 方式一：生产模式（推荐用于测试）

双击运行 `start.bat`

```bash
start.bat
```

**功能**：
- ✅ 自动安装依赖（如果不存在）
- ✅ 编译 API 服务
- ✅ 编译 Admin 前端
- ✅ 启动生产模式服务

**服务地址**：
- API Server: http://localhost:3000
- API 文档: http://localhost:3000/api
- Admin 后台: http://localhost:4173

### 方式二：开发模式（推荐用于开发）

双击运行 `start-dev.bat`

```bash
start-dev.bat
```

**功能**：
- ✅ 自动安装依赖（如果不存在）
- ✅ 启动 API 开发服务（热重载）
- ✅ 启动 Admin 开发服务（热重载）
- ✅ 代码修改自动重载

**服务地址**：
- API Server: http://localhost:3000
- API 文档: http://localhost:3000/api
- Admin 后台: http://localhost:5173

**开发模式特性**：
- 🔥 热重载 - 修改代码自动刷新
- 🔍 实时编译 - 保存即编译
- 🐛 调试友好 - 完整的错误堆栈

### 停止所有服务

双击运行 `stop.bat`

```bash
stop.bat
```

**功能**：
- ✅ 停止所有 Docms API 服务
- ✅ 停止所有 Docms Admin 服务
- ✅ 清理占用的端口（3000, 4173, 5173）

## 📋 系统要求

- **Node.js**: 18.0+
- **npm**: 9.0+
- **操作系统**: Windows 10/11
- **磁盘空间**: 至少 500MB（用于依赖）

## 🔧 脚本详解

### start.bat - 生产模式启动

**执行流程**：

1. **环境检查**
   - 检查 Node.js 是否安装
   - 检查 npm 是否安装
   - 显示版本信息

2. **API 构建**
   - 检查并安装依赖 (`npm install`)
   - 生成 Prisma Client (`npm run prisma:generate`)
   - 编译 TypeScript (`npm run build`)

3. **Admin 构建**
   - 检查并安装依赖 (`npm install`)
   - 编译 Vue 应用 (`npm run build`)

4. **启动服务**
   - 在新窗口启动 API 生产服务 (`npm run start:prod`)
   - 在新窗口启动 Admin 预览服务 (`npm run preview`)

**适用场景**：
- 生产环境部署前测试
- 性能测试
- 功能验收测试

### start-dev.bat - 开发模式启动

**执行流程**：

1. **环境检查**
   - 检查 Node.js 是否安装
   - 检查 npm 是否安装

2. **依赖安装**
   - 安装 API 依赖
   - 生成 Prisma Client
   - 安装 Admin 依赖

3. **启动开发服务**
   - 在新窗口启动 API 开发服务 (`npm run start:dev`)
   - 在新窗口启动 Admin 开发服务 (`npm run dev`)

**适用场景**：
- 日常开发
- 调试功能
- 快速迭代

### stop.bat - 停止服务

**执行流程**：

1. **查找进程**
   - 通过窗口标题查找 Docms 相关进程

2. **终止服务**
   - 终止 API 服务进程
   - 终止 Admin 服务进程

3. **清理端口**
   - 清理占用 3000 端口的进程（API）
   - 清理占用 5173 端口的进程（Admin Dev）
   - 清理占用 4173 端口的进程（Admin Preview）

**适用场景**：
- 停止所有服务
- 端口被占用需要清理
- 服务异常需要重启

## 🛠️ 常见问题

### 1. 端口被占用

**问题**：启动时提示端口 3000/5173/4173 已被占用

**解决方案**：
```bash
# 运行停止脚本
stop.bat

# 或手动查找并终止进程
netstat -ano | findstr :3000
taskkill /F /PID <进程ID>
```

### 2. 依赖安装失败

**问题**：`npm install` 失败

**解决方案**：
```bash
# 清理缓存
cd api
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 或使用淘宝镜像
npm install --registry=https://registry.npmmirror.com
```

### 3. Prisma Client 生成失败

**问题**：`prisma generate` 失败

**解决方案**：
```bash
cd api
npx prisma generate
# 如果数据库未初始化
npx prisma migrate dev
```

### 4. 编译失败

**问题**：TypeScript 编译错误

**解决方案**：
```bash
# API 编译问题
cd api
npm run lint
npm run build

# Admin 编译问题
cd admin
npm run lint
vue-tsc --noEmit
npm run build
```

### 5. 服务窗口闪退

**问题**：启动后服务窗口立即关闭

**解决方案**：
- 检查 `package.json` 中的脚本是否正确
- 手动进入目录运行命令查看错误信息：
  ```bash
  cd api
  npm run start:dev
  ```

### 6. 数据库未初始化

**问题**：API 启动失败，提示数据库错误

**解决方案**：
```bash
cd api
# 运行数据库迁移
npm run prisma:migrate
# 填充种子数据
npm run prisma:seed
```

## 📝 手动启动（不使用批处理脚本）

如果批处理脚本无法正常工作，可以手动启动：

### API 服务

```bash
# 进入API目录
cd api

# 安装依赖
npm install

# 生成Prisma Client
npm run prisma:generate

# 开发模式
npm run start:dev

# 或生产模式
npm run build
npm run start:prod
```

### Admin 服务

```bash
# 进入Admin目录
cd admin

# 安装依赖
npm install

# 开发模式
npm run dev

# 或生产模式
npm run build
npm run preview
```

## 🔍 日志和调试

### 查看服务日志

启动脚本会在独立的命令行窗口中运行服务，可以直接在窗口中查看日志。

### 调试模式

```bash
# API 调试模式
cd api
npm run start:debug

# Admin 开发模式已包含调试功能
cd admin
npm run dev
```

### 测试运行

```bash
# 运行API测试
cd api
npm run test
npm run test:e2e

# 运行Admin测试
cd admin
npm run test
npm run test:coverage
```

## 🌐 访问服务

启动成功后，访问以下地址：

### API 服务
- **Swagger文档**: http://localhost:3000/api
- **健康检查**: http://localhost:3000/health (如果配置了)

### Admin 后台
- **登录页面**: http://localhost:5173 (开发) 或 http://localhost:4173 (生产)
- **默认账号**: admin / admin123 (根据种子数据)

## 📂 项目结构

```
docms.nz/
├── api/                    # NestJS API 服务
│   ├── src/               # 源代码
│   ├── prisma/            # 数据库schema和迁移
│   ├── dist/              # 编译输出
│   └── package.json
│
├── admin/                  # Vue3 Admin 前端
│   ├── src/               # 源代码
│   ├── dist/              # 编译输出
│   └── package.json
│
├── start.bat              # 生产模式启动脚本
├── start-dev.bat          # 开发模式启动脚本
├── stop.bat               # 停止服务脚本
└── STARTUP_GUIDE.md       # 本文档
```

## 🎯 最佳实践

### 开发流程

1. **首次启动**
   ```bash
   # 使用开发模式
   start-dev.bat
   ```

2. **日常开发**
   - 保持开发服务运行
   - 修改代码自动重载
   - 无需重启服务

3. **测试验收**
   ```bash
   # 停止开发服务
   stop.bat

   # 启动生产模式
   start.bat
   ```

4. **提交代码前**
   ```bash
   # 运行测试
   cd api && npm run test
   cd admin && npm run test

   # 运行代码检查
   cd api && npm run lint
   cd admin && npm run lint
   ```

### 性能建议

- **开发时**: 使用 `start-dev.bat` 获得最佳开发体验
- **测试时**: 使用 `start.bat` 测试生产环境性能
- **重启**: 遇到问题先 `stop.bat` 再重新启动

## 🔒 安全提示

⚠️ **生产环境部署注意事项**：

1. **不要使用这些脚本直接部署到生产环境**
2. 生产环境应使用：
   - Docker 容器化部署
   - PM2 进程管理
   - Nginx 反向代理
   - HTTPS 证书
   - 环境变量配置

3. **修改默认密码和密钥**
4. **配置防火墙规则**
5. **启用日志记录和监控**

## 📖 相关文档

- [API 文档](./API_DOCUMENTATION.md)
- [Admin 实现总结](./admin/COMPLETE_IMPLEMENTATION_SUMMARY.md)
- [项目完成路线图](./admin/PROJECT_COMPLETION_ROADMAP.md)
- [API 测试报告](./API_TEST_REPORT_FINAL_100PERCENT.md)
- [集成测试文档](./admin/API_INTEGRATION_TESTING.md)

## 💡 技巧和提示

### 快捷方式

可以在桌面创建快捷方式：
1. 右键点击 `start-dev.bat`
2. 选择"发送到" > "桌面快捷方式"
3. 重命名为"启动 Docms 开发环境"

### 自定义端口

如果需要修改端口，编辑以下文件：

**API 端口** (默认 3000):
```typescript
// api/src/main.ts
await app.listen(3000, '0.0.0.0')
```

**Admin 端口**:
```javascript
// admin/vite.config.ts
server: {
  port: 5173  // 开发模式
}
preview: {
  port: 4173  // 预览模式
}
```

### 环境变量

创建 `.env` 文件配置环境变量：

```bash
# api/.env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=3000

# admin/.env
VITE_API_URL=http://localhost:3000
```

## 🤝 贡献

如果发现批处理脚本有问题或需要改进，欢迎提交Issue或PR。

---

**最后更新**: 2025-10-23
**维护者**: Docms Team
**版本**: 1.0.0
