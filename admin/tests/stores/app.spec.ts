import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '@/stores/app'
import { createTestPinia } from '../utils/test-utils'

describe('App Store', () => {
  beforeEach(() => {
    createTestPinia()
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should have correct default state', () => {
      const store = useAppStore()

      expect(store.collapsed).toBe(false)
      expect(store.theme).toBe('light')
      expect(store.loadingBar).toBe(false)
    })

    it('should restore theme from localStorage', () => {
      localStorage.setItem('theme', 'dark')

      const store = useAppStore()

      expect(store.theme).toBe('dark')
    })
  })

  describe('Getters', () => {
    it('isSidebarCollapsed should return collapsed state', () => {
      const store = useAppStore()

      expect(store.isSidebarCollapsed).toBe(false)

      store.collapsed = true
      expect(store.isSidebarCollapsed).toBe(true)
    })

    it('currentTheme should return current theme', () => {
      const store = useAppStore()

      expect(store.currentTheme).toBe('light')

      store.theme = 'dark'
      expect(store.currentTheme).toBe('dark')
    })

    it('isLoadingBarActive should return loading bar state', () => {
      const store = useAppStore()

      expect(store.isLoadingBarActive).toBe(false)

      store.loadingBar = true
      expect(store.isLoadingBarActive).toBe(true)
    })
  })

  describe('Actions - Sidebar', () => {
    it('toggleSidebar should toggle collapsed state', () => {
      const store = useAppStore()

      expect(store.collapsed).toBe(false)

      store.toggleSidebar()
      expect(store.collapsed).toBe(true)

      store.toggleSidebar()
      expect(store.collapsed).toBe(false)
    })

    it('setSidebarCollapsed should set specific state', () => {
      const store = useAppStore()

      store.setSidebarCollapsed(true)
      expect(store.collapsed).toBe(true)

      store.setSidebarCollapsed(false)
      expect(store.collapsed).toBe(false)
    })
  })

  describe('Actions - Theme', () => {
    it('toggleTheme should toggle theme and save to localStorage', () => {
      const store = useAppStore()

      expect(store.theme).toBe('light')

      store.toggleTheme()
      expect(store.theme).toBe('dark')
      expect(localStorage.getItem('theme')).toBe('dark')

      store.toggleTheme()
      expect(store.theme).toBe('light')
      expect(localStorage.getItem('theme')).toBe('light')
    })

    it('setTheme should set specific theme and save to localStorage', () => {
      const store = useAppStore()

      store.setTheme('dark')
      expect(store.theme).toBe('dark')
      expect(localStorage.getItem('theme')).toBe('dark')

      store.setTheme('light')
      expect(store.theme).toBe('light')
      expect(localStorage.getItem('theme')).toBe('light')
    })
  })

  describe('Actions - Loading Bar', () => {
    it('startLoadingBar should set loadingBar to true', () => {
      const store = useAppStore()

      expect(store.loadingBar).toBe(false)

      store.startLoadingBar()
      expect(store.loadingBar).toBe(true)
    })

    it('finishLoadingBar should set loadingBar to false', () => {
      const store = useAppStore()
      store.loadingBar = true

      store.finishLoadingBar()
      expect(store.loadingBar).toBe(false)
    })

    it('should handle loading bar lifecycle', () => {
      const store = useAppStore()

      // Start
      store.startLoadingBar()
      expect(store.isLoadingBarActive).toBe(true)

      // Finish
      store.finishLoadingBar()
      expect(store.isLoadingBarActive).toBe(false)
    })
  })
})
