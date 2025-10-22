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
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto, PostQueryDto, PostResponseDto } from './dto/post.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('文章管理')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建文章' })
  @ApiResponse({ status: 201, description: '创建成功', type: PostResponseDto })
  create(@Body() createPostDto: CreatePostDto, @Request() req: any) {
    return this.postService.create(createPostDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: '获取文章列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Query() query: PostQueryDto) {
    return this.postService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取文章详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: PostResponseDto })
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新文章' })
  @ApiResponse({ status: 200, description: '更新成功', type: PostResponseDto })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Request() req: any) {
    return this.postService.update(id, updatePostDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除文章' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.postService.remove(id, req.user);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布文章' })
  @ApiResponse({ status: 200, description: '发布成功', type: PostResponseDto })
  publish(@Param('id') id: string, @Request() req: any) {
    return this.postService.publish(id, req.user);
  }
}
