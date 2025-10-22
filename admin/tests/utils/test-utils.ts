import { createPinia, setActivePinia } from 'pinia'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createMemoryHistory, Router } from 'vue-router'
import { vi } from 'vitest'
import type { Component } from 'vue'

// Mock Naive UI's useMessage
const mockMessage = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  loading: vi.fn()
}

vi.mock('naive-ui', async () => {
  const actual = await vi.importActual('naive-ui')
  return {
    ...actual,
    useMessage: () => mockMessage
  }
})

/**
 * Create a fresh Pinia instance for testing
 */
export function createTestPinia() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/**
 * Create a test router with memory history
 */
export function createTestRouter(routes: any[] = []): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes
  })
}

/**
 * Mount component with common test providers (Pinia, Router, etc.)
 */
export interface MountOptions {
  props?: Record<string, any>
  global?: {
    plugins?: any[]
    mocks?: Record<string, any>
    stubs?: Record<string, any>
  }
  router?: Router
  attachTo?: HTMLElement
}

export function mountWithProviders(
  component: Component,
  options: MountOptions = {}
): VueWrapper {
  const pinia = createTestPinia()
  const router = options.router || createTestRouter()

  const plugins = [pinia, router, ...(options.global?.plugins || [])]

  return mount(component, {
    ...options,
    global: {
      ...options.global,
      plugins,
      stubs: {
        teleport: true,
        ...options.global?.stubs
      }
    }
  })
}

/**
 * Wait for async operations to complete
 */
export async function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Mock API response helper
 */
export function mockApiResponse<T>(data: T, success = true) {
  return {
    success,
    data,
    message: success ? 'Success' : 'Error'
  }
}
