import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { BlockRegistryService, BlockDefinition, Block } from './block-registry.service';

interface CreateBlockDto {
  type: string;
  props?: any;
  order?: number;
  visibility?: boolean;
}

interface ValidateBlockDto {
  type: string;
  props: any;
}

interface ValidateBlockResponseDto {
  valid: boolean;
  errors?: string[];
}

@ApiTags('区块系统')
@Controller('blocks')
export class BlocksController {
  constructor(private readonly blockRegistryService: BlockRegistryService) {}

  @Get('types')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取所有可用区块类型' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', description: '区块类型' },
          label: { type: 'string', description: '区块标签' },
          icon: { type: 'string', description: '区块图标' },
          category: { type: 'string', description: '区块分类' },
          description: { type: 'string', description: '区块描述' },
          schema: { type: 'object', description: 'JSON Schema' },
          defaultProps: { type: 'object', description: '默认属性' },
        },
      },
    },
  })
  async getBlockTypes(): Promise<BlockDefinition[]> {
    return this.blockRegistryService.getAll();
  }

  @Get('types/:type')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '根据类型获取区块定义' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '区块类型不存在' })
  async getBlockTypeByType(@Param('type') type: string): Promise<BlockDefinition> {
    const blockDefinition = this.blockRegistryService.getByType(type as any);

    if (!blockDefinition) {
      throw new NotFoundException('区块类型不存在');
    }

    return blockDefinition;
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证区块数据' })
  @ApiResponse({
    status: 200,
    description: '验证完成',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean', description: '是否有效' },
        errors: { type: 'array', items: { type: 'string' }, description: '错误信息列表' },
      },
    },
  })
  async validateBlock(
    @Body() validateBlockDto: ValidateBlockDto,
  ): Promise<ValidateBlockResponseDto> {
    return this.blockRegistryService.validate(validateBlockDto.type as any, validateBlockDto.props);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建新区块实例' })
  @ApiResponse({ status: 200, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async createBlock(
    @Body() createBlockDto: CreateBlockDto,
  ): Promise<Block> {
    try {
      const block = this.blockRegistryService.createBlock(
        createBlockDto.type as any,
        {
          props: createBlockDto.props,
          order: createBlockDto.order,
          visibility: createBlockDto.visibility,
        },
      );

      return block;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取区块分类列表' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: '分类名称' },
          label: { type: 'string', description: '分类标签' },
          count: { type: 'number', description: '该分类下的区块数量' },
        },
      },
    },
  })
  async getCategories(): Promise<Array<{ name: string; label: string; count: number }>> {
    const allBlocks = this.blockRegistryService.getAll();
    const categories = new Map<string, number>();

    allBlocks.forEach(block => {
      const count = categories.get(block.category) || 0;
      categories.set(block.category, count + 1);
    });

    const categoryLabels = {
      layout: '布局',
      content: '内容',
      media: '媒体',
      form: '表单',
      advanced: '高级',
    };

    return Array.from(categories.entries()).map(([name, count]) => ({
      name,
      label: categoryLabels[name] || name,
      count,
    }));
  }

  @Get('examples/:type')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取区块示例数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '区块类型不存在' })
  async getBlockExample(@Param('type') type: string): Promise<Block> {
    const blockDefinition = this.blockRegistryService.getByType(type as any);

    if (!blockDefinition) {
      throw new NotFoundException('区块类型不存在');
    }

    // 创建一个示例区块实例
    return this.blockRegistryService.createBlock(type as any, {
      order: 1,
      visibility: true,
    });
  }
}