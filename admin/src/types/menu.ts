import { MenuItemType, LinkType } from './api'

// 菜单项
export interface MenuItem {
  id: string
  menuCode: string // 'main' | 'footer'
  label: string
  slug: string
  type: MenuItemType
  linkType: LinkType
  linkTarget?: string
  parentId?: string
  order: number
  icon?: string
  isVisible: boolean
  isActive: boolean
  createdAt: string
  updatedAt?: string
  children?: MenuItem[]
}

// 创建菜单项请求
export interface CreateMenuItemRequest {
  menuCode: string
  label: string
  slug: string
  type: MenuItemType
  linkType: LinkType
  linkTarget?: string
  parentId?: string
  order?: number
  icon?: string
  isVisible?: boolean
  isActive?: boolean
}

// 更新菜单项请求
export interface UpdateMenuItemRequest extends Partial<CreateMenuItemRequest> {
  id: string
}

// 菜单树节点（用于显示）
export interface MenuTreeNode extends MenuItem {
  children?: MenuTreeNode[]
  level?: number
}
