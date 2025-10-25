import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '仪表盘' }
      },
      // 菜单管理
      {
        path: 'menu',
        name: 'MenuManagement',
        component: () => import('@/views/menu/MenuManagement.vue'),
        meta: { title: '菜单管理' }
      },
      // 媒体库
      {
        path: 'media',
        name: 'MediaLibrary',
        component: () => import('@/views/media/MediaLibrary.vue'),
        meta: { title: '媒体库' }
      },
      // 页面管理
      {
        path: 'pages',
        name: 'PageList',
        component: () => import('@/views/pages/PageList.vue'),
        meta: { title: '页面列表' }
      },
      {
        path: 'pages/:id/edit',
        name: 'PageEditor',
        component: () => import('@/views/pages/PageEditor.vue'),
        meta: { title: '编辑页面' }
      },
      // 动态页面路由 - 通过 slug 或 id 访问页面编辑器
      {
        path: 'pages/:slugOrId',
        name: 'PageBySlug',
        component: () => import('@/views/pages/PageEditor.vue'),
        meta: { title: '编辑页面' }
      },
      // 文章管理
      {
        path: 'posts',
        name: 'PostList',
        component: () => import('@/views/posts/PostList.vue'),
        meta: { title: '文章列表' }
      },
      {
        path: 'posts/create',
        name: 'PostCreate',
        component: () => import('@/views/posts/PostEditor.vue'),
        meta: { title: '新建文章' }
      },
      {
        path: 'posts/:id/edit',
        name: 'PostEditor',
        component: () => import('@/views/posts/PostEditor.vue'),
        meta: { title: '编辑文章' }
      },
      // 分类管理
      {
        path: 'categories',
        name: 'CategoryManagement',
        component: () => import('@/views/categories/CategoryManagement.vue'),
        meta: { title: '分类管理' }
      },
      // 标签管理
      {
        path: 'tags',
        name: 'TagManagement',
        component: () => import('@/views/tags/TagManagement.vue'),
        meta: { title: '标签管理' }
      },
      // 产品管理
      {
        path: 'products',
        name: 'ProductList',
        component: () => import('@/views/products/ProductList.vue'),
        meta: { title: '产品列表' }
      },
      {
        path: 'products/create',
        name: 'ProductCreate',
        component: () => import('@/views/products/ProductEditor.vue'),
        meta: { title: '新建产品' }
      },
      {
        path: 'products/:id/edit',
        name: 'ProductEditor',
        component: () => import('@/views/products/ProductEditor.vue'),
        meta: { title: '编辑产品' }
      },
      // 表单管理
      {
        path: 'forms',
        name: 'FormList',
        component: () => import('@/views/forms/FormList.vue'),
        meta: { title: '表单管理' }
      },
      // 站点设置
      {
        path: 'site',
        name: 'SiteSettings',
        component: () => import('@/views/site/SiteSettings.vue'),
        meta: { title: '站点设置' }
      },
      // 用户管理
      {
        path: 'users',
        name: 'UserList',
        component: () => import('@/views/users/UserList.vue'),
        meta: { title: '用户管理' }
      },
      // 审计日志
      {
        path: 'audit',
        name: 'AuditLog',
        component: () => import('@/views/audit/AuditLogList.vue'),
        meta: { title: '审计日志' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFound.vue'),
    meta: { title: '404' }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  document.title = to.meta.title 
    ? `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE}`
    : import.meta.env.VITE_APP_TITLE

  // 检查是否需要认证
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth) {
    // 需要认证
    if (!authStore.isAuthenticated) {
      // 未登录，跳转到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      // 已登录，检查是否有用户信息
      if (!authStore.user) {
        // 尝试获取用户信息
        const result = await authStore.fetchUserProfile()
        if (result.success) {
          next()
        } else {
          // 获取用户信息失败，跳转到登录页
          next({
            path: '/login',
            query: { redirect: to.fullPath }
          })
        }
      } else {
        next()
      }
    }
  } else {
    // 不需要认证
    if (to.path === '/login' && authStore.isAuthenticated) {
      // 已登录用户访问登录页，跳转到首页
      next('/')
    } else {
      next()
    }
  }
})

export default router
