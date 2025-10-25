import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FormSubmissionService } from './form-submission.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('form-submissions')
export class FormSubmissionController {
  constructor(private readonly formSubmissionService: FormSubmissionService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR)
  async findAll(@Query() query: any) {
    return this.formSubmissionService.findAll(query);
  }

  @Get('form-codes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR)
  async getFormCodes() {
    return this.formSubmissionService.getFormCodes();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR)
  async findOne(@Param('id') id: string) {
    return this.formSubmissionService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    // Public endpoint for form submissions from frontend
    // Extract IP and UA from request in a real implementation
    return this.formSubmissionService.create(data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.formSubmissionService.delete(id);
  }

  @Post('batch-delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async batchDelete(@Body() body: { ids: string[] }) {
    return this.formSubmissionService.deleteMany(body.ids);
  }
}
