import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { User, UserRole, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto, UserListQuery } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get paginated user list with filters
   */
  async findAll(query: UserListQuery) {
    const { page = 1, limit = 10, search, role } = query;
    // Convert to numbers to ensure Prisma receives integers
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { displayName: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  /**
   * Get single user by ID
   */
  async findOne(id: string): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  /**
   * Create new user
   */
  async create(createUserDto: CreateUserDto, currentUser?: any): Promise<Partial<User>> {
    const { email, password, displayName, role } = createUserDto;

    // Only OWNER and ADMIN can create users
    if (currentUser && ![UserRole.OWNER, UserRole.ADMIN].includes(currentUser.role)) {
      throw new ForbiddenException('权限不足');
    }

    // ADMIN cannot create OWNER
    if (currentUser?.role === UserRole.ADMIN && role === UserRole.OWNER) {
      throw new ForbiddenException('管理员无法创建所有者账号');
    }

    // Check if email is valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('邮箱格式不正确');
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('该邮箱已被注册');
    }

    // Password validation
    if (password.length < 6) {
      throw new BadRequestException('密码长度至少为6位');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        role,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Update user
   */
  async update(id: string, updateUserDto: UpdateUserDto, currentUser?: any): Promise<Partial<User>> {
    // Only OWNER and ADMIN can update users
    if (currentUser && ![UserRole.OWNER, UserRole.ADMIN].includes(currentUser.role)) {
      throw new ForbiddenException('权限不足');
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('用户不存在');
    }

    // Prevent users from demoting themselves
    if (currentUser && currentUser.userId === id && updateUserDto.role && updateUserDto.role !== existingUser.role) {
      throw new ForbiddenException('不能修改自己的角色');
    }

    // ADMIN cannot modify OWNER
    if (currentUser?.role === UserRole.ADMIN && existingUser.role === UserRole.OWNER) {
      throw new ForbiddenException('管理员无法修改所有者账号');
    }

    // ADMIN cannot promote users to OWNER
    if (currentUser?.role === UserRole.ADMIN && updateUserDto.role === UserRole.OWNER) {
      throw new ForbiddenException('管理员无法将用户提升为所有者');
    }

    // Check email uniqueness if email is being changed
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailExists) {
        throw new BadRequestException('该邮箱已被使用');
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (updateUserDto.email) {
      updateData.email = updateUserDto.email;
    }

    if (updateUserDto.displayName) {
      updateData.displayName = updateUserDto.displayName;
    }

    if (updateUserDto.role) {
      updateData.role = updateUserDto.role;
    }

    if (updateUserDto.password) {
      // Validate password length
      if (updateUserDto.password.length < 6) {
        throw new BadRequestException('密码长度至少为6位');
      }
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Delete user
   */
  async remove(id: string, currentUser?: any): Promise<void> {
    // Only OWNER can delete users
    if (currentUser && currentUser.role !== UserRole.OWNER) {
      throw new ForbiddenException('只有所有者可以删除用户');
    }

    // Prevent users from deleting themselves
    if (currentUser && currentUser.userId === id) {
      throw new ForbiddenException('不能删除自己的账号');
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // Delete user
    await this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Toggle user active status (future feature)
   * Note: User model doesn't have isActive field yet, this is for future use
   */
  async toggleActive(id: string): Promise<Partial<User>> {
    throw new BadRequestException('该功能暂未实现');
  }
}
