# Docms v1.0 AI 执行计划（API → 管理后台 → 前台）

## 参考依据
- 《CMS-PRD-v1.0.md》：功能范围、数据模型、API 边界、交互要点。
- 《管理后台结构示意图.png》：后台一级“网站栏目”动态导航 + 二级内容管理区 + 顶部全局操作布局。

## 阶段视图
| 阶段 | 核心目标 | 主要输出 | 进入下一阶段的门槛 |
| --- | --- | --- | --- |
| 0. 基线筹备 | 构建 AI 可运行的开发环境与基线资产 | docker-compose 基础栈、代码规范、CI 雏形、设计 Tokens 草案 | 主干分支可运行的空项目骨架；AI 调度器锁定 API→Admin→Frontend 顺序 |
| 1. Backend API | 由 AI 自动构建 v1.0 所需后端能力 | NestJS 应用、Prisma schema + migration、模块化业务逻辑、测试、种子数据 | 自动集成测试通过；Swagger/JSON Schema 自动产出；API 稳定 |
| 2. API 文档 | 生成可供前端/外部调用的标准文档 | OpenAPI 文档、手册、示例请求、版本说明 | 文档自动发布并覆盖每个端点；示例与真实环境一致 |
| 3. 管理后台（Admin） | 构建“网站栏目为主导航”的后台体验 | Vue3 + Naive UI 应用、区块化编辑器、内容管理工作流 | 功能通过自动化回归；关键角色流程在模拟数据下跑通 |
| 4. 前台（Nuxt 3） | 交付面向访客的 SEO/SSG 展示站点 | Nuxt SSG 站点、主题换肤、动态渲染 Blocks/列表/详情、表单提交 | 所有栏目自动生成，SEO 配置生效；静态产物可部署 |
| 5. 收尾上线 | 完成全链路自检与自动部署策略 | 端到端测试报告、运维手册、备份策略、上线 Checklist | 零级阻塞问题关闭；一键部署 + 回滚脚本完成 |

---

## 阶段 0：基线筹备
- **开发栈落地**：AI 初始化 monorepo 或多仓结构（api / admin / frontend）；配置 pnpm/yarn workspace、ESLint、Prettier、lint-staged、commitlint。
- **基础容器**：根据 PRD 第 5 章，生成 `docker-compose.yml`（api、admin、nuxt-ssg、sqlite+uploads volume），确保一键启动脚本可被 AI 调用。
- **设计资源**：整理 PRD 中的 Design Tokens（颜色、字体、圆角、阴影）；如设计稿缺失，由 AI 输出初版 Figma/设计草稿。
- **CI/CD 雏形**：搭建自动流水线（安装依赖、lint、单元测试）；写入发布分支策略供调度器读取。
- **验收标准**：`docker compose up` 后健康检查返回 200，Admin/Frontend 站点渲染占位页面，AI 监控确认通过。

## 阶段 1：Backend API 实施
> 对应 PRD 第 5~7 章；先实现核心能力，再补充横切关注点。

1. **项目基建**
   - NestJS + Fastify 初始化，配置 ConfigModule、class-validator/transformer。
   - 接入 Prisma：根据 PRD 第 6 章建模，生成 schema.prisma、初始 migration、种子数据脚本（管理员账号、示例栏目/区块）。
   - 建立模块目录（auth/site/media/menu/page/post/product/form/search/seo/blockRegistry）。

2. **鉴权与权限**
   - 用户注册/登录/刷新/重置密码（JWT 双 token）。
   - RBAC 守卫：Owner/Admin/Editor/Author/Viewer 权限矩阵（PRD 3.2）。
   - 审计日志：记录关键操作到 `AuditLog`。

3. **站点级模块**
   - Site 设置：Theme Tokens、全局配置、SEO 默认值。
   - Design Tokens 输出：供 Admin/Frontend 读取。

4. **内容与菜单模块**
   - Media：上传（多 part）、替换、元信息编辑；限制 MIME。
   - MenuItem：支持 menuCode（main/footer）、层级、排序、显隐；实现“左侧动态导航”所需接口。
   - Page with Blocks：Blocks JSON 存储、版本历史、预发布草稿、区块校验（`/blocks/validate` 使用 BlockRegistry schema）。
   - Post：分类、标签、发布状态、menuItem 关联。
   - Product：分类、标签、规格、主图/图集、menuItem 关联，仅展示属性。
   - Form：表单定义 + Submission 存储；支持 IP、UA、spamScore 字段预留。

5. **搜索与 SEO**
   - `GET /search?q=` 全站 LIKE 查询（标题/摘要/正文/产品）。
   - 动态生成 `sitemap.xml`、`robots.txt`、`/seo/jsonld/:type/:slug`。

6. **横切能力**
   - 数据校验（DTO + Zod/自定义校验）、错误处理（统一异常过滤器）。
   - 文件系统（`/uploads`）抽象，预留 S3 适配。
   - 配置 WAL、事务、分页、排序、软删/上下线等能力。

7. **质量保障**
   - 单元 + 集成测试（Jest + supertest），覆盖关键 CRUD、权限、搜索。
   - E2E Smoke：用 Postman/Newman 或 Pact 测试核心流程。
   - 性能基线：关键端点 P95 响应 < 300ms（PRD 第 8 章）。

8. **阶段交付**
   - Swagger UI + OpenAPI JSON 自动更新。
   - 产出 API Changelog（记录断言/字段变更）。
   - 通过 AI 静态分析、性能基线与数据结构一致性校验。

## 阶段 2：API 文档与协作
1. **自动文档**
   - 使用 `@nestjs/swagger` 生成；补充 DTO 注释、示例。
   - 保证与 Prisma 模型同步；CI 中校验 schema 变化。
2. **手册与范例**
   - 为每类资源撰写操作指南（Auth、菜单、页面、区块、文章、产品、表单、搜索、SEO）。
   - 准备 cURL / HTTPie 示例，覆盖创建、更新、查询、分页、过滤。
   - 记录权限矩阵与失败响应示例（401/403/422/429）。
3. **发布方式**
   - 本地 Swagger UI、可选 Redoc 浏览。
   - 导出静态 HTML / JSON，部署在 `docs/` 或 Docsite。
4. **验收**
   - Admin/Frontend 生成器可依文档完成 Mock 接入。
   - 文档缺失项自动记录并清零。

## 阶段 3：管理后台（Vue3 + Naive UI）
> 对应 PRD 第 4 章与示意图。遵循“网站栏目 = 左侧导航 | 二级内容区 | 顶部操作栏”的整体框架。

1. **项目基建**
   - Vite + Vue3 + TypeScript；配置 Pinia、Vue Router、UnoCSS/Tailwind（若需）、i18n。
   - 接入 UI：Naive UI 主题定制，映射 Design Tokens。
   - Axios + OpenAPI Client（可用 `orval`/`openapi-typescript` 自动生成）。

2. **主框架实现**
   - 布局：左侧动态“网站栏目”树（根据 `/menu-items` 数据），顶部全局动作（搜索、主题切换、用户菜单），右侧内容区。
   - 全局能力：登录/登出、权限守卫、路由拦截、面包屑。
   - Dashboard：站点总览（内容统计、最近操作/提交）。

3. **模块页面**
   - 菜单管理：树形编辑（拖拽排序、显隐、链接类型）；实时同步左侧导航。
   - 页面编辑（Blocks 编辑器）：列表视图 + 预览视图、区块选择器、拖拽排序、媒体库弹窗、自动保存。
   - 文章管理：分类/标签筛选、Markdown/富文本编辑、草稿/发布流程。
   - 产品管理：规格、图集、多分类、Featured 标记。
   - 媒体库：上传、替换、裁剪、元信息编辑。
   - 表单管理：表单构建器（字段定义）、Submission 列表、导出 CSV。
   - SEO 设置：站点级 + 页面级 SEO 表单；可预览 SERP/OG。
   - 权限与用户：角色管理、操作日志查看。

4. **辅助功能**
   - 草稿箱 & 版本对比（Page/Post Product 根据 PRD 4.4）。
   - 区块模板快速应用；支持复制/粘贴/隐藏。
   - 多语言/多站点预留（至少在数据模型与 UI 留扩展点）。

5. **质量保障**
   - 单元测试（组件级）+ E2E（Cypress/Playwright）。
   - 无障碍（键盘导航、ARIA）、响应式适配。
   - 性能：首屏加载拆包、懒加载编辑器。

6. **交付检查**
   - “从零创建站点栏目 → 填充内容 → 发布”的流程演练。
   - 与后端联调问题归档；阻塞项清零后进入下一阶段。

## 阶段 4：前台展示站点（Nuxt 3）
1. **项目基建**
   - Nuxt 3 + TypeScript；SSG 默认，Fallback SSR。
   - 集成 Design Tokens（Tailwind 主题 / CSS 变量）。
   - OpenAPI client or REST fetch 封装；全局错误/404/500 页。

2. **页面类型实现**
   - 首页/单页（Blocks 渲染）：根据 `blocks` JSON 动态匹配组件，确保与 Admin 编辑器一致。
   - 列表页（Post/Product）：分页、分类/标签筛选、排序。
   - 详情页：SEO Meta、结构化数据、面包屑。
   - 通用页面：关于、联系我们、FAQ、解决方案等（来自 Page）。

3. **功能与交互**
   - 表单：与 Form API 联动，含前端验证、提交反馈、防重复提交。
   - 搜索：全局搜索栏（头部 + 独立结果页）。
   - 媒体优化：图片懒加载、响应式、占位符。
   - 主题换肤：基于 Design Tokens 的 CSS 变量。

4. **SEO & 发布**
   - 站点地图、robots、OG/Twitter Meta：从 API 读取并在构建时注入。
   - 生成静态产物（Nuxt `nuxi generate`），验证部署包体积。
   - 部署流程：静态资源 -> CDN，API 走反向代理/独立域名。

5. **测试**
   - Lighthouse ≥ 90（性能/可访问性/SEO）。
   - E2E 验证主要用户路径（浏览->搜索->提交表单）。

## 阶段 5：收尾与上线
- **联调回归**：Admin ↔ API ↔ Frontend 全链路自动回归，使用真实数据脚本演练。
- **数据策略**：生成备份/恢复流程（`app.db` + `/uploads`）；注册定时任务。
- **监控 & 安全**：接入日志、错误上报（Sentry）、健康检查；暴露 Prometheus/metrics。
- **上线 Checklist**：环境变量清单、数据库迁移脚本、回滚策略、上线通知模板，全部自动化归档。
- **文档沉淀**：运维手册、FAQ、培训材料由 AI 汇编并同步至知识库。

---

## 自动迭代节奏（示例）
1. 周期 1：完成阶段 0 + 阶段 1 初版（核心模块 CRUD 可用）。
2. 周期 2：API 文档定稿 & 管理后台 MVP（栏目/区块/文章可编辑）。
3. 周期 3：前台 SSG 生成完整站点，SEO 校验通过。
4. 周期 4：端到端打通 + 性能/安全加固。
5. 周期 5：上线 + 回归报告归档。

> 时间刻度由调度器依据任务复杂度自动评估；默认遵循 API 优先、逐层解锁 UI 的顺序，避免返工。

---

## 风险与关注点
- **需求变更**：PRD v1.0 之外的能力（预约、支付、AI）严格留到 v2.0，若提前介入需评估对数据库与 API 的影响。
- **区块生态**：BlockRegistry 是前后端耦合点，必须定义统一 schema 与版本策略，避免渲染不一致。
- **性能压力**：SSG + CDN 是默认方案，但后台导出的媒体/文件需要限制大小或引入异步处理。
- **权限管理**：多角色并发编辑需明确锁定/提示策略，避免数据覆盖。
- **多语言支持**：PRD 仅提到 locale 字段，若后续支持多语种，需要提前在 API/数据层预留结构。

---

## 下一步建议
1. 由 AI 调度器基于本计划拆解任务，并写入看板/流水线配置。
2. 在 API 阶段前执行 Prisma schema 自动校验脚本，锁定数据模型。
3. 同步生成 Design Tokens 与样式规范，确保 Admin/前台视觉一致。
