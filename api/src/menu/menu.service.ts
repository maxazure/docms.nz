import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { MenuItem, UserRole, MenuItemType, LinkType } from '@prisma/client';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu.dto';

export interface MenuTreeNode {
  id: string;
  menuCode: string;
  label: string;
  slug: string;
  type: MenuItemType;
  linkType: LinkType;
  linkTarget: string;
  parentId?: string;
  order: number;
  icon?: string;
  isVisible: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  children?: MenuTreeNode[];
}

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create new menu item
   */
  async create(createMenuItemDto: CreateMenuItemDto, user?: any): Promise<any> {
    // Check permissions - only OWNER, ADMIN, EDITOR, and AUTHOR can create menus
    if (user && ![UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    const menuItem = await this.prisma.menuItem.create({
      data: {
        menuCode: createMenuItemDto.menuCode,
        label: createMenuItemDto.label,
        slug: createMenuItemDto.slug,
        type: createMenuItemDto.type,
        parentId: createMenuItemDto.parentId,
        order: createMenuItemDto.order || 0,
        icon: createMenuItemDto.icon,
        linkTarget: createMenuItemDto.linkTarget,
        linkType: createMenuItemDto.linkType || LinkType.INTERNAL,
        isVisible: createMenuItemDto.isVisible ?? true,
        isActive: createMenuItemDto.isActive ?? true,
      },
    });

    return menuItem;
  }

  /**
   * Get all menu items with optional filtering
   */
  async findAll(options: { visibleOnly?: boolean } = {}): Promise<any[]> {
    const { visibleOnly } = options;

    const menuItems = await this.prisma.menuItem.findMany({
      where: visibleOnly ? {
        isVisible: true,
        isActive: true,
      } : undefined,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return menuItems;
  }

  /**
   * Get hierarchical menu tree
   */
  async getMenuTree(options: { visibleOnly?: boolean } = {}): Promise<MenuTreeNode[]> {
    const menuItems = await this.findAll(options);
    return this.buildTree(menuItems);
  }

  /**
   * Get menu item by ID
   */
  async findOne(id: string): Promise<any> {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
    });

    if (!menuItem) {
      throw new NotFoundException('菜单项未找到');
    }

    return menuItem;
  }

  /**
   * Update menu item
   */
  async update(id: string, updateMenuItemDto: UpdateMenuItemDto, user?: any): Promise<any> {
    // Check permissions - only OWNER, ADMIN and EDITOR can update menus
    if (user && ![UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    const existingMenuItem = await this.findOne(id);

    const updatedMenuItem = await this.prisma.menuItem.update({
      where: { id },
      data: updateMenuItemDto,
    });

    return updatedMenuItem;
  }

  /**
   * Delete menu item
   */
  async remove(id: string, user?: any): Promise<any> {
    // Check permissions - only OWNER, ADMIN and EDITOR can delete menus
    if (user && ![UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    const existingMenuItem = await this.findOne(id);

    // Check if menu item has children
    const childCount = await this.prisma.menuItem.count({
      where: { parentId: id },
    });

    if (childCount > 0) {
      throw new BadRequestException('无法删除包含子菜单的菜单项');
    }

    const deletedMenuItem = await this.prisma.menuItem.delete({
      where: { id },
    });

    return deletedMenuItem;
  }

  /**
   * Build hierarchical tree structure from flat list
   */
  async buildTree(menuItems: any[]): Promise<MenuTreeNode[]> {
    const itemMap = new Map<string, MenuTreeNode>();
    const rootItems: MenuTreeNode[] = [];

    // Convert all items to tree nodes
    menuItems.forEach(item => {
      const treeNode: MenuTreeNode = { ...item };
      itemMap.set(item.id, treeNode);
    });

    // Build tree structure
    menuItems.forEach(item => {
      const treeNode = itemMap.get(item.id)!;

      if (item.parentId && itemMap.has(item.parentId)) {
        const parent = itemMap.get(item.parentId)!;
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(treeNode);
      } else {
        rootItems.push(treeNode);
      }
    });

    // Sort children by order
    rootItems.forEach(item => {
      if (item.children && item.children.length > 0) {
        item.children.sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    });

    return rootItems;
  }

  /**
   * Reorder menu items
   */
  async reorder(orders: { id: string; order: number }[], user?: any): Promise<void> {
    // Check permissions - only OWNER, ADMIN and EDITOR can reorder menus
    if (user && ![UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    // Update order for each menu item
    const updatePromises = orders.map(({ id, order }) =>
      this.prisma.menuItem.update({
        where: { id },
        data: { order },
      }),
    );

    await Promise.all(updatePromises);
  }

  /**
   * Toggle menu item visibility
   */
  async toggleVisibility(id: string, user?: any): Promise<MenuItem> {
    const menuItem = await this.findOne(id);

    // Check permissions - only OWNER, ADMIN and EDITOR can toggle visibility
    if (user && ![UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    const updatedMenuItem = await this.prisma.menuItem.update({
      where: { id },
      data: { isVisible: !menuItem.isVisible },
    });

    return updatedMenuItem;
  }

}
