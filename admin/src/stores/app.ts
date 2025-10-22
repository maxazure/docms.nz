import { defineStore } from 'pinia'

interface AppState {
  collapsed: boolean // 侧边栏是否折叠
  theme: 'light' | 'dark'
  loadingBar: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    collapsed: false,
    theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
    loadingBar: false
  }),

  getters: {
    isSidebarCollapsed: (state) => state.collapsed,
    currentTheme: (state) => state.theme,
    isLoadingBarActive: (state) => state.loadingBar
  },

  actions: {
    // 切换侧边栏折叠状态
    toggleSidebar() {
      this.collapsed = !this.collapsed
    },

    // 设置侧边栏状态
    setSidebarCollapsed(collapsed: boolean) {
      this.collapsed = collapsed
    },

    // 切换主题
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', this.theme)
    },

    // 设置主题
    setTheme(theme: 'light' | 'dark') {
      this.theme = theme
      localStorage.setItem('theme', theme)
    },

    // 显示加载条
    startLoadingBar() {
      this.loadingBar = true
    },

    // 隐藏加载条
    finishLoadingBar() {
      this.loadingBar = false
    }
  }
})
