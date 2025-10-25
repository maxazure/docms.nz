import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto, ProductResponseDto } from './dto/product.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('产品管理')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建产品' })
  @ApiResponse({ status: 201, description: '创建成功', type: ProductResponseDto })
  create(@Body() createProductDto: CreateProductDto, @Request() req: any) {
    return this.productService.create(createProductDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: '获取产品列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取产品详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: ProductResponseDto })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新产品' })
  @ApiResponse({ status: 200, description: '更新成功', type: ProductResponseDto })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req: any) {
    return this.productService.update(id, updateProductDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除产品' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.productService.remove(id, req.user);
  }

  @Post(':id/toggle-active')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '切换产品激活状态' })
  @ApiResponse({ status: 200, description: '切换成功', type: ProductResponseDto })
  toggleActive(@Param('id') id: string, @Request() req: any) {
    return this.productService.toggleActive(id, req.user);
  }

  @Post(':id/toggle-featured')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '切换产品推荐状态' })
  @ApiResponse({ status: 200, description: '切换成功', type: ProductResponseDto })
  toggleFeatured(@Param('id') id: string, @Request() req: any) {
    return this.productService.toggleFeatured(id, req.user);
  }
}
