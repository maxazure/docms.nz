<template>
  <n-layout-sider
    bordered
    :collapsed="appStore.sidebarCollapsed"
    collapse-mode="width"
    :collapsed-width="64"
    :width="240"
    show-trigger="arrow-circle"
    @collapse="appStore.toggleSidebar"
    @expand="appStore.toggleSidebar"
    :native-scrollbar="false"
    class="app-sidebar"
  >
    <!-- Logo -->
    <div class="sidebar-logo">
      <div v-if="!appStore.sidebarCollapsed" class="logo-full">
        <h2>Docms</h2>
      </div>
      <div v-else class="logo-collapsed">
        <span>D</span>
      </div>
    </div>

    <!-- 动态菜单导航 -->
    <n-menu
      v-model:value="activeKey"
      :collapsed="appStore.sidebarCollapsed"
      :collapsed-width="64"
      :collapsed-icon-size="22"
      :options="menuOptions"
    />
  </n-layout-sider>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import {
  HomeOutline,
  CubeOutline,
  BulbOutline,
  ConstructOutline,
  NewspaperOutline,
  InformationCircleOutline,
  CallOutline,
  ImageOutline,
  ChatbubbleOutline,
  MenuOutline,
  SettingsOutline,
  PeopleOutline,
  DocumentTextOutline,
  ChevronDownOutline
} from '@vicons/ionicons5'
import { useAppStore } from '@/stores/app'
import { useMenuStore } from '@/stores/menu'
import type { MenuItem } from '@/types'

const router = useRouter()
const appStore = useAppStore()
const menuStore = useMenuStore()

// 当前激活的菜单项
const activeKey = computed({
  get: () => router.currentRoute.value.path,
  set: (key: string) => {
    router.push(key)
  }
})

// 图标映射
const iconMap: Record<string, any> = {
  home: HomeOutline,
  cube: CubeOutline,
  bulb: BulbOutline,
  construct: ConstructOutline,
  newspaper: NewspaperOutline,
  information: InformationCircleOutline,
  call: CallOutline,
  image: ImageOutline,
  chatbubble: ChatbubbleOutline,
  menu: MenuOutline,
  settings: SettingsOutline,
  people: PeopleOutline,
  document: DocumentTextOutline
}

// 根据栏目类型获取路由路径
const getRoutePathByType = (menuItem: MenuItem): string => {
  const { id, slug, type } = menuItem
  switch (type) {
    case 'page':
      return `/pages/${slug || id}`
    case 'postList':
      return `/posts?menuId=${id}`
    case 'product':
      return `/products?menuId=${id}`
    default:
      return `/pages/${slug || id}`
  }
}

// 将 MenuItem 转换为 Naive UI MenuOption
const convertToMenuOption = (item: MenuItem): MenuOption => {
  const iconName = item.icon || 'document'
  const IconComponent = iconMap[iconName] || DocumentTextOutline

  const option: MenuOption = {
    label: item.label,
    key: getRoutePathByType(item),
    // Convert icon string to render function immediately
    icon: () => h(NIcon, null, { default: () => h(IconComponent) })
  }

  if (item.children && item.children.length > 0) {
    option.children = item.children.map(convertToMenuOption)
  }

  return option
}

// 构建菜单选项
const menuOptions = computed<MenuOption[]>(() => {
  const options: MenuOption[] = []

  // 一级：网站栏目（动态生成）
  const mainMenuTree = menuStore.mainMenuTree || []
  if (mainMenuTree.length > 0) {
    options.push({
      type: 'group',
      label: '网站栏目',
      key: 'website-columns',
      children: mainMenuTree.map(convertToMenuOption)
    })
  }

  // 二级：内容管理
  options.push({
    type: 'group',
    label: '内容管理',
    key: 'content-management',
    children: [
      {
        label: '媒体库',
        key: '/media',
        icon: () => h(NIcon, null, { default: () => h(ImageOutline) })
      },
      {
        label: '留言管理',
        key: '/forms',
        icon: () => h(NIcon, null, { default: () => h(ChatbubbleOutline) })
      }
    ]
  })

  // 三级：系统设置
  options.push({
    type: 'group',
    label: '系统设置',
    key: 'system-settings',
    children: [
      {
        label: '菜单管理',
        key: '/menu',
        icon: () => h(NIcon, null, { default: () => h(MenuOutline) })
      },
      {
        label: '站点设置',
        key: '/site',
        icon: () => h(NIcon, null, { default: () => h(SettingsOutline) })
      },
      {
        label: '用户与权限',
        key: '/users',
        icon: () => h(NIcon, null, { default: () => h(PeopleOutline) })
      },
      {
        label: '审计日志',
        key: '/audit',
        icon: () => h(NIcon, null, { default: () => h(DocumentTextOutline) })
      }
    ]
  })

  return options
})
</script>

<style scoped>
.app-sidebar {
  height: 100vh;
}

.sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--n-border-color);
  transition: all 0.3s;
}

.logo-full {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-full h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--n-text-color-1);
  letter-spacing: 1px;
}

.logo-collapsed {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: white;
}

:deep(.n-menu-item-content) {
  padding-left: 24px !important;
}

:deep(.n-menu-item-content--collapsed) {
  padding-left: 20px !important;
}

:deep(.n-submenu-children .n-menu-item-content) {
  padding-left: 48px !important;
}
</style>
