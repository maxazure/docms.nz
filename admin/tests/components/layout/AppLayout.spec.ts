import { describe, it, expect } from 'vitest'
import { mountWithProviders } from '../../utils/test-utils'
import AppLayout from '@/components/layout/AppLayout.vue'
import { createRouter, createMemoryHistory } from 'vue-router'

describe('AppLayout Component', () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        component: AppLayout,
        children: [
          {
            path: 'dashboard',
            component: { template: '<div>Dashboard Content</div>' }
          }
        ]
      }
    ]
  })

  it('should render all layout components', async () => {
    const wrapper = mountWithProviders(AppLayout, { router })

    // Should render sidebar
    expect(wrapper.findComponent({ name: 'AppSidebar' }).exists()).toBe(true)

    // Should render header
    expect(wrapper.findComponent({ name: 'AppHeader' }).exists()).toBe(true)

    // Should render content area
    expect(wrapper.find('.app-content').exists()).toBe(true)

    // Should render footer
    expect(wrapper.find('.app-footer').exists()).toBe(true)
  })

  it('should render footer with correct content', () => {
    const wrapper = mountWithProviders(AppLayout, { router })

    const footer = wrapper.find('.app-footer')
    expect(footer.text()).toContain('© 2025 Docms. All rights reserved.')
    expect(footer.text()).toContain('GitHub')
    expect(footer.text()).toContain('文档')
    expect(footer.text()).toContain('关于')
  })

  it('should have correct layout structure', () => {
    const wrapper = mountWithProviders(AppLayout, { router })

    // Should have n-layout with has-sider
    expect(wrapper.find('.app-layout').exists()).toBe(true)

    // Content area should have proper styling
    const content = wrapper.find('.app-content')
    expect(content.exists()).toBe(true)
    expect(content.classes()).toContain('app-content')
  })

  it('should render router-view for nested routes', async () => {
    await router.push('/dashboard')
    await router.isReady()

    const wrapper = mountWithProviders(AppLayout, { router })

    // Router view should be present
    const routerView = wrapper.findComponent({ name: 'RouterView' })
    expect(routerView.exists()).toBe(true)
  })

  it('should have keep-alive for cached views', () => {
    const wrapper = mountWithProviders(AppLayout, { router })

    // Should have KeepAlive component
    const keepAlive = wrapper.findComponent({ name: 'KeepAlive' })
    expect(keepAlive.exists()).toBe(true)

    // Should include specified views
    const cachedViews = (wrapper.vm as any).cachedViews
    expect(cachedViews).toContain('Dashboard')
    expect(cachedViews).toContain('PageList')
    expect(cachedViews).toContain('PostList')
    expect(cachedViews).toContain('ProductList')
    expect(cachedViews).toContain('MediaLibrary')
  })
})
