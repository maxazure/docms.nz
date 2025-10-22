# Docms CMS API 测试计划

**版本**: v1.0
**测试日期**: 2025-01-22
**测试环境**: http://localhost:3000

## 测试目标

1. 验证所有API端点的功能正确性
2. 确保权限控制正常工作
3. 验证数据验证和错误处理
4. 测试CRUD操作的完整性
5. 确保API响应格式一致性

## 测试范围

### 模块列表

1. ✅ 认证模块 (6个端点)
2. ✅ 权限管理模块 (3个端点)
3. ✅ 站点管理模块 (4个端点)
4. ✅ 媒体管理模块 (5个端点)
5. ✅ 菜单管理模块 (6个端点)
6. ✅ 区块系统模块 (6个端点)
7. ✅ 页面管理模块 (17个端点)
8. ✅ 分类管理模块 (7个端点)
9. ✅ 标签管理模块 (5个端点)
10. ✅ 文章管理模块 (6个端点)
11. ✅ 产品管理模块 (6个端点)

**总计**: 71个API端点

## 测试策略

### 1. 功能测试
- 正常流程测试
- 边界值测试
- 异常流程测试

### 2. 权限测试
- 未认证用户访问
- 不同角色权限验证
- 跨用户数据访问

### 3. 数据验证测试
- 必填字段验证
- 数据类型验证
- 格式验证
- 唯一性验证

### 4. 集成测试
- 模块间数据关联
- 级联操作验证
- 事务一致性

## 测试用例

### 1. 认证模块测试

#### TC-AUTH-001: 用户注册
- **前置条件**: 无
- **测试步骤**:
  1. POST /auth/register with valid data
  2. 验证返回accessToken和refreshToken
  3. 验证用户创建成功
- **预期结果**: 201 Created, 返回用户信息和令牌
- **测试数据**:
  ```json
  {
    "email": "test@example.com",
    "password": "Test123456",
    "role": "AUTHOR"
  }
  ```

#### TC-AUTH-002: 重复邮箱注册
- **前置条件**: 用户已存在
- **测试步骤**:
  1. POST /auth/register with existing email
- **预期结果**: 400 Bad Request, "邮箱已存在"

#### TC-AUTH-003: 用户登录
- **前置条件**: 用户已注册
- **测试步骤**:
  1. POST /auth/login with correct credentials
- **预期结果**: 200 OK, 返回令牌

#### TC-AUTH-004: 错误密码登录
- **前置条件**: 用户已注册
- **测试步骤**:
  1. POST /auth/login with wrong password
- **预期结果**: 401 Unauthorized

#### TC-AUTH-005: 令牌刷新
- **前置条件**: 用户已登录
- **测试步骤**:
  1. POST /auth/refresh with valid refreshToken
- **预期结果**: 200 OK, 返回新的accessToken

#### TC-AUTH-006: 获取用户信息
- **前置条件**: 用户已登录
- **测试步骤**:
  1. GET /auth/profile with valid token
- **预期结果**: 200 OK, 返回用户详情

---

### 2. 权限管理模块测试

#### TC-PERM-001: 获取权限列表
- **前置条件**: 用户已认证
- **测试步骤**:
  1. GET /permissions
- **预期结果**: 200 OK, 返回所有权限

#### TC-PERM-002: 获取权限层级
- **前置条件**: 用户已认证
- **测试步骤**:
  1. GET /permissions/hierarchy
- **预期结果**: 200 OK, 返回权限树

#### TC-PERM-003: 检查角色权限
- **前置条件**: 用户已认证
- **测试步骤**:
  1. GET /permissions/check/ADMIN
- **预期结果**: 200 OK, 返回权限检查结果

---

### 3. 分类管理模块测试

#### TC-CAT-001: 创建分类
- **前置条件**: ADMIN/EDITOR已登录
- **测试步骤**:
  1. POST /categories with valid data
- **预期结果**: 201 Created
- **测试数据**:
  ```json
  {
    "name": "技术教程",
    "slug": "tech-tutorials",
    "description": "技术相关教程",
    "order": 1
  }
  ```

#### TC-CAT-002: 创建子分类
- **前置条件**: 父分类存在
- **测试步骤**:
  1. POST /categories with parentId
- **预期结果**: 201 Created

#### TC-CAT-003: 获取分类树
- **前置条件**: 分类已创建
- **测试步骤**:
  1. GET /categories/tree
- **预期结果**: 200 OK, 返回树形结构

#### TC-CAT-004: 重复slug验证
- **前置条件**: 分类已存在
- **测试步骤**:
  1. POST /categories with existing slug
- **预期结果**: 400 Bad Request

#### TC-CAT-005: 删除有子分类的分类
- **前置条件**: 分类有子分类
- **测试步骤**:
  1. DELETE /categories/:id
- **预期结果**: 400 Bad Request, "存在子分类"

---

### 4. 标签管理模块测试

#### TC-TAG-001: 创建标签
- **前置条件**: ADMIN/EDITOR已登录
- **测试步骤**:
  1. POST /tags with valid data
- **预期结果**: 201 Created
- **测试数据**:
  ```json
  {
    "name": "水培技术",
    "slug": "hydroponics"
  }
  ```

#### TC-TAG-002: 搜索标签
- **前置条件**: 标签已创建
- **测试步骤**:
  1. GET /tags?search=水培
- **预期结果**: 200 OK, 返回匹配标签

#### TC-TAG-003: 更新标签
- **前置条件**: 标签已创建
- **测试步骤**:
  1. PUT /tags/:id with new data
- **预期结果**: 200 OK

---

### 5. 文章管理模块测试

#### TC-POST-001: 创建文章草稿
- **前置条件**: AUTHOR已登录
- **测试步骤**:
  1. POST /posts with status=DRAFT
- **预期结果**: 201 Created
- **测试数据**:
  ```json
  {
    "title": "水培技术入门指南",
    "slug": "hydroponics-guide",
    "summary": "了解水培种植的基础知识",
    "content": {"type": "html", "data": "<p>内容</p>"},
    "status": "DRAFT",
    "categoryIds": ["cat-1"],
    "tagIds": ["tag-1"]
  }
  ```

#### TC-POST-002: 作者编辑自己的文章
- **前置条件**: 文章由当前用户创建
- **测试步骤**:
  1. PATCH /posts/:id
- **预期结果**: 200 OK

#### TC-POST-003: 作者编辑他人文章
- **前置条件**: 文章由其他用户创建
- **测试步骤**:
  1. PATCH /posts/:id
- **预期结果**: 403 Forbidden

#### TC-POST-004: 管理员发布文章
- **前置条件**: ADMIN已登录, 文章为DRAFT
- **测试步骤**:
  1. POST /posts/:id/publish
- **预期结果**: 200 OK, publishedAt已设置

#### TC-POST-005: 作者发布文章
- **前置条件**: AUTHOR已登录
- **测试步骤**:
  1. POST /posts/:id/publish
- **预期结果**: 403 Forbidden

#### TC-POST-006: 分页查询文章
- **前置条件**: 多篇文章已创建
- **测试步骤**:
  1. GET /posts?page=1&limit=10
- **预期结果**: 200 OK, 返回分页数据

#### TC-POST-007: 按分类筛选文章
- **前置条件**: 文章关联分类
- **测试步骤**:
  1. GET /posts?categoryId=cat-1
- **预期结果**: 200 OK, 返回该分类下的文章

#### TC-POST-008: 搜索文章
- **前置条件**: 文章已创建
- **测试步骤**:
  1. GET /posts?search=水培
- **预期结果**: 200 OK, 返回匹配文章

---

### 6. 产品管理模块测试

#### TC-PROD-001: 创建产品
- **前置条件**: ADMIN/EDITOR已登录
- **测试步骤**:
  1. POST /products with valid data
- **预期结果**: 201 Created
- **测试数据**:
  ```json
  {
    "name": "智能水培系统 Pro",
    "slug": "smart-hydroponic-pro",
    "summary": "专业级智能水培种植系统",
    "specs": {"size": "120x60x180cm", "capacity": "48 plants"},
    "price": 2999.00,
    "categoryId": "cat-1",
    "tagIds": ["tag-1", "tag-2"]
  }
  ```

#### TC-PROD-002: 价格区间筛选
- **前置条件**: 产品已创建
- **测试步骤**:
  1. GET /products?minPrice=1000&maxPrice=5000
- **预期结果**: 200 OK, 返回价格在范围内的产品

#### TC-PROD-003: 切换激活状态
- **前置条件**: ADMIN已登录, 产品已创建
- **测试步骤**:
  1. POST /products/:id/toggle-active
- **预期结果**: 200 OK, isActive已切换

#### TC-PROD-004: EDITOR切换激活状态
- **前置条件**: EDITOR已登录
- **测试步骤**:
  1. POST /products/:id/toggle-active
- **预期结果**: 403 Forbidden

---

### 7. 页面管理模块测试

#### TC-PAGE-001: 创建页面
- **前置条件**: ADMIN/EDITOR已登录
- **测试步骤**:
  1. POST /pages with blocks
- **预期结果**: 201 Created

#### TC-PAGE-002: 添加区块到页面
- **前置条件**: 页面已创建
- **测试步骤**:
  1. POST /pages/:id/blocks
- **预期结果**: 200 OK, 创建版本快照

#### TC-PAGE-003: 重排区块顺序
- **前置条件**: 页面有多个区块
- **测试步骤**:
  1. PUT /pages/:id/blocks/reorder
- **预期结果**: 200 OK

#### TC-PAGE-004: 生成预览令牌
- **前置条件**: 页面已创建
- **测试步骤**:
  1. POST /pages/:id/preview/token
- **预期结果**: 200 OK, 返回token

#### TC-PAGE-005: 通过令牌预览页面
- **前置条件**: 预览令牌已生成
- **测试步骤**:
  1. GET /pages/preview/:token
- **预期结果**: 200 OK, 返回页面内容

#### TC-PAGE-006: 版本恢复
- **前置条件**: 页面有版本历史
- **测试步骤**:
  1. POST /pages/:id/versions/:versionId/restore
- **预期结果**: 200 OK

---

### 8. 菜单管理模块测试

#### TC-MENU-001: 创建菜单项
- **前置条件**: ADMIN/EDITOR已登录
- **测试步骤**:
  1. POST /menu with valid data
- **预期结果**: 201 Created

#### TC-MENU-002: 创建子菜单
- **前置条件**: 父菜单存在
- **测试步骤**:
  1. POST /menu with parentId
- **预期结果**: 201 Created

#### TC-MENU-003: 获取菜单树
- **前置条件**: 菜单已创建
- **测试步骤**:
  1. GET /menu/tree
- **预期结果**: 200 OK, 返回树形结构

---

### 9. 区块系统模块测试

#### TC-BLOCK-001: 获取区块类型
- **前置条件**: 用户已认证
- **测试步骤**:
  1. GET /blocks/types
- **预期结果**: 200 OK, 返回12种区块类型

#### TC-BLOCK-002: 验证区块数据
- **前置条件**: 用户已认证
- **测试步骤**:
  1. POST /blocks/validate with valid props
- **预期结果**: 200 OK, valid=true

#### TC-BLOCK-003: 验证无效区块数据
- **前置条件**: 用户已认证
- **测试步骤**:
  1. POST /blocks/validate with invalid props
- **预期结果**: 200 OK, valid=false, errors[]

---

### 10. 媒体管理模块测试

#### TC-MEDIA-001: 上传媒体文件
- **前置条件**: 用户已认证
- **测试步骤**:
  1. POST /media with file
- **预期结果**: 201 Created

#### TC-MEDIA-002: 获取媒体列表
- **前置条件**: 媒体已上传
- **测试步骤**:
  1. GET /media?page=1&limit=10
- **预期结果**: 200 OK, 返回分页数据

#### TC-MEDIA-003: 删除媒体文件
- **前置条件**: 媒体已上传
- **测试步骤**:
  1. DELETE /media/:id
- **预期结果**: 200 OK

---

## 测试环境配置

### 测试数据准备

1. **测试用户**:
   - OWNER: owner@test.com / Owner123456
   - ADMIN: admin@test.com / Admin123456
   - EDITOR: editor@test.com / Editor123456
   - AUTHOR: author@test.com / Author123456
   - VIEWER: viewer@test.com / Viewer123456

2. **测试分类**:
   - 技术教程 (tech-tutorials)
   - 产品介绍 (products)
   - 新手指南 (beginner-guide)

3. **测试标签**:
   - 水培 (hydroponics)
   - 智能 (smart)
   - 节能 (energy-saving)

4. **测试文章**:
   - 10篇草稿文章
   - 10篇已发布文章
   - 不同作者的文章

5. **测试产品**:
   - 5个不同价格区间的产品
   - 不同分类的产品

### 测试工具

- **API测试**: Postman / Bruno
- **自动化测试**: Jest + Supertest
- **性能测试**: Apache Bench
- **文档**: Swagger UI

## 测试执行计划

### Phase 1: 基础功能测试 (Day 1)
- 认证模块
- 权限管理模块
- 分类和标签模块

### Phase 2: 内容管理测试 (Day 2)
- 文章管理模块
- 产品管理模块
- 页面管理模块

### Phase 3: 高级功能测试 (Day 3)
- 区块系统模块
- 菜单管理模块
- 媒体管理模块
- 版本控制和预览功能

### Phase 4: 集成测试 (Day 4)
- 跨模块数据关联
- 权限控制验证
- 端到端流程测试

### Phase 5: 性能和压力测试 (Day 5)
- 并发请求测试
- 大数据量测试
- 响应时间测试

## 缺陷管理

### 缺陷等级

- **P0 - 致命**: 系统崩溃、数据丢失
- **P1 - 严重**: 核心功能无法使用
- **P2 - 一般**: 功能异常但有变通方案
- **P3 - 轻微**: UI问题、文案错误

### 缺陷报告模板

```markdown
**缺陷ID**: BUG-001
**等级**: P1
**模块**: 文章管理
**标题**: 作者无法编辑自己的文章
**重现步骤**:
1. 以AUTHOR身份登录
2. 创建文章
3. 尝试编辑该文章
**预期结果**: 编辑成功
**实际结果**: 403 Forbidden
**截图**: [附件]
**环境**: localhost:3000
**发现时间**: 2025-01-22 10:00
```

## 测试交付物

1. ✅ API测试计划文档 (本文档)
2. ⏳ API测试用例集合 (Postman/Bruno)
3. ⏳ 自动化测试脚本
4. ⏳ 测试执行报告
5. ⏳ 缺陷报告
6. ⏳ 测试总结报告

## 验收标准

- ✅ 所有P0、P1缺陷已修复
- ✅ 核心功能测试通过率 ≥ 99%
- ✅ 权限控制测试通过率 = 100%
- ✅ API响应时间 < 200ms (p95)
- ✅ 无数据安全隐患
- ✅ Swagger文档完整准确

---

*测试计划版本: v1.0*
*创建时间: 2025-01-22*
*负责人: Claude*
