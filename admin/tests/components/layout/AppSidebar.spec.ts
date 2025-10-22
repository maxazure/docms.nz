import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountWithProviders, flushPromises } from '../../utils/test-utils'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useMenuStore } from '@/stores/menu'
import { useAppStore } from '@/stores/app'
import type { MenuItem } from '@/types'

describe('AppSidebar Component', () => {
  const mockMenuItems: MenuItem[] = [
    {
      id: '1',
      label: '首页',
      slug: 'home',
      type: 'page',
      menuCode: 'main',
      linkType: 'internal',
      order: 1,
      isVisible: true,
      isActive: true,
      icon: 'home',
      parentId: null
    },
    {
      id: '2',
      label: '产品中心',
      slug: 'products',
      type: 'product',
      menuCode: 'main',
      linkType: 'internal',
      order: 2,
      isVisible: true,
      isActive: true,
      icon: 'cube',
      parentId: null
    },
    {
      id: '3',
      label: '家庭水培设备',
      slug: 'home-hydroponics',
      type: 'product',
      menuCode: 'main',
      linkType: 'internal',
      order: 1,
      isVisible: true,
      isActive: true,
      icon: 'cube',
      parentId: '2'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render logo correctly when expanded', () => {
    const wrapper = mountWithProviders(AppSidebar)
    const appStore = useAppStore()

    appStore.sidebarCollapsed = false

    expect(wrapper.text()).toContain('Docms')
  })

  it('should render collapsed logo when sidebar is collapsed', async () => {
    const wrapper = mountWithProviders(AppSidebar)
    const appStore = useAppStore()

    appStore.sidebarCollapsed = true
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.logo-collapsed').exists()).toBe(true)
  })

  it('should render menu groups correctly', async () => {
    const wrapper = mountWithProviders(AppSidebar)
    const menuStore = useMenuStore()

    menuStore.menuTree = mockMenuItems.filter(item => !item.parentId)

    await flushPromises()
    await wrapper.vm.$nextTick()

    // Should have 3 menu groups: 网站栏目, 内容管理, 系统设置
    expect(wrapper.text()).toContain('网站栏目')
    expect(wrapper.text()).toContain('内容管理')
    expect(wrapper.text()).toContain('系统设置')
  })

  it('should render dynamic menu items from store', async () => {
    const wrapper = mountWithProviders(AppSidebar)
    const menuStore = useMenuStore()

    menuStore.mainMenuItems = mockMenuItems

    await flushPromises()
    await wrapper.vm.$nextTick()

    // Should display menu labels
    expect(wrapper.text()).toContain('首页')
    expect(wrapper.text()).toContain('产品中心')
  })

  it('should call fetchMenu on mount', () => {
    const menuStore = useMenuStore()
    const fetchMenuSpy = vi.spyOn(menuStore, 'fetchMenu')

    mountWithProviders(AppSidebar)

    expect(fetchMenuSpy).toHaveBeenCalled()
  })

  it('should generate correct route paths based on menu type', () => {
    const wrapper = mountWithProviders(AppSidebar)

    // Access component instance
    const vm = wrapper.vm as any

    // Test page type
    const pageRoute = vm.getRoutePathByType({
      id: '1',
      slug: 'about',
      type: 'page'
    } as MenuItem)
    expect(pageRoute).toBe('/pages/about')

    // Test postList type
    const postListRoute = vm.getRoutePathByType({
      id: '2',
      slug: 'news',
      type: 'postList'
    } as MenuItem)
    expect(postListRoute).toBe('/posts?menuId=2')

    // Test product type
    const productRoute = vm.getRoutePathByType({
      id: '3',
      slug: 'products',
      type: 'product'
    } as MenuItem)
    expect(productRoute).toBe('/products?menuId=3')
  })

  it('should render static menu items', async () => {
    const wrapper = mountWithProviders(AppSidebar)
    await wrapper.vm.$nextTick()

    // Content management group
    expect(wrapper.text()).toContain('媒体库')
    expect(wrapper.text()).toContain('留言管理')

    // System settings group
    expect(wrapper.text()).toContain('菜单管理')
    expect(wrapper.text()).toContain('站点设置')
    expect(wrapper.text()).toContain('用户与权限')
    expect(wrapper.text()).toContain('审计日志')
  })
})
