# 前台网站故障排查

## 问题: Nuxt欢迎页面而非自定义页面

### 症状
访问 http://localhost:3006 显示"Welcome to Nuxt!"欢迎页面,而不是我们自定义的首页。

### 已尝试的解决方案
1. ✅ 清理.nuxt缓存目录
2. ✅ 清理node_modules/.vite缓存
3. ✅ 重启开发服务器
4. ✅ 添加future.compatibilityVersion配置
5. ❌ 所有方法都未解决问题

### 根本原因分析

检查了以下文件,都存在且格式正确:
- ✅ app.vue存在并有效
- ✅ pages/index.vue存在
- ✅ pages/[slug].vue存在
- ✅ layouts/default.vue存在
- ✅ components目录完整

**可能的原因**:
1. **Nuxt 4.2.0的breaking change**: Nuxt 4.x可能改变了pages的检测逻辑
2. **API连接失败**: pages/index.vue尝试调用useApi()获取数据,可能因为API服务器未运行而失败
3. **服务端渲染错误**: SSR过程中可能有未捕获的错误导致回退到欢迎页面

### 推荐解决方案

#### 方案1: 确保API服务器运行 (最可能的原因)

```bash
# 检查API服务器是否运行
curl http://localhost:3000/api/pages/by-slug/home

# 如果返回404或连接错误,需要启动API服务器
cd api
npm run dev
```

**原因**: pages/index.vue的代码:
```typescript
const { data: page, pending, error } = await useAsyncData('home-page', async () => {
  try {
    return await api.pages.getBySlug('home')
  } catch (err: any) {
    console.error('Failed to fetch home page:', err)
    if (err.statusCode === 404) {
      return null
    }
    throw err
  }
})
```

如果API调用失败,页面会抛出错误,Nuxt可能回退到欢迎页面。

#### 方案2: 临时创建静态首页测试

创建一个不依赖API的临时首页:

```vue
<!-- pages/index.vue.backup -->
<template>
  <div class="container mx-auto px-4 py-16">
    <h1 class="text-4xl font-bold mb-4">Docms 前台网站</h1>
    <p class="text-gray-600 mb-8">网站正常运行!</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <NuxtLink to="/posts" class="block p-6 bg-white rounded-lg shadow hover:shadow-lg">
        <h2 class="text-xl font-bold mb-2">文章</h2>
        <p class="text-gray-600">浏览所有文章</p>
      </NuxtLink>

      <NuxtLink to="/products" class="block p-6 bg-white rounded-lg shadow hover:shadow-lg">
        <h2 class="text-xl font-bold mb-2">产品</h2>
        <p class="text-gray-600">查看产品目录</p>
      </NuxtLink>

      <div class="block p-6 bg-white rounded-lg shadow">
        <h2 class="text-xl font-bold mb-2">SEO</h2>
        <p class="text-gray-600">
          <a href="/sitemap.xml" class="text-primary hover:underline">Sitemap</a> |
          <a href="/robots.txt" class="text-primary hover:underline">Robots</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '首页 - Docms CMS',
  meta: [
    { name: 'description', content: 'Docms CMS前台展示网站' }
  ]
})
</script>
```

#### 方案3: 检查浏览器控制台

在浏览器中访问 http://localhost:3006 并打开开发者工具(F12):
1. 查看Console标签是否有JavaScript错误
2. 查看Network标签检查API请求是否失败
3. 查看Vue DevTools(如果安装)检查组件树

#### 方案4: 使用完整启动脚本

使用项目根目录的启动脚本同时启动所有服务:

**Windows**:
```bash
cd D:\projects\docms.nz
.\start-dev.bat
```

**Linux/Mac**:
```bash
cd /path/to/docms.nz
./start-dev.sh
```

这将确保:
- API服务器在3000端口运行
- Admin在5173端口运行
- Website在3001端口运行(或自动选择的端口)

### 验证步骤

按以下顺序验证:

1. **验证API服务器**:
   ```bash
   curl http://localhost:3000/api/site
   ```
   应该返回站点配置JSON

2. **验证数据库**:
   ```bash
   # 检查是否有home页面
   curl http://localhost:3000/api/pages/by-slug/home
   ```

   如果返回404,需要在Admin后台创建slug为"home"的页面

3. **创建测试页面** (在Admin后台):
   - 登录 http://localhost:5173
   - 左侧菜单 -> 页面 -> 新增页面
   - Slug: `home`
   - 标题: `首页`
   - 添加一些测试区块(如HeroBlock、TextBlock)
   - 状态设为`PUBLISHED`
   - 保存

4. **重新访问前台**:
   ```bash
   # 清空浏览器缓存后访问
   http://localhost:3006
   ```

### 当前状态

- ✅ 所有代码文件已创建并完整
- ✅ 所有12种区块组件已实现
- ✅ SEO功能(sitemap/robots)已实现
- ⚠️ 需要验证API连接
- ⚠️ 需要在数据库中创建测试数据

### 下一步操作

**推荐执行顺序**:

1. 启动完整环境:
   ```bash
   cd D:\projects\docms.nz
   .\start-dev.bat
   ```

2. 在Admin后台创建首页:
   - 访问 http://localhost:5173
   - 创建slug为"home"的页面
   - 添加测试区块

3. 访问前台验证:
   - http://localhost:3001 (或自动选择的端口)
   - 应该显示自定义首页而非欢迎页面

4. 测试所有功能:
   - 首页区块渲染
   - 文章列表/详情
   - 产品列表/详情
   - SEO页面(sitemap.xml/robots.txt)

### 备注

如果上述方案都不工作,可能是Nuxt 4.2.0的bug。建议:
1. 降级到Nuxt 3.x稳定版本
2. 或等待Nuxt 4.x的bug修复
3. 或在GitHub issue中报告问题

当前使用的Nuxt版本: 4.2.0 (最新版,可能有不稳定性)
