import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { Prisma } from '@prisma/client';

export interface FormSubmissionListQuery {
  page?: number;
  limit?: number;
  formCode?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateFormSubmissionDto {
  formCode: string;
  payload: Record<string, any>;
  ip?: string;
  ua?: string;
  spamScore?: number;
}

@Injectable()
export class FormSubmissionService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: FormSubmissionListQuery) {
    // Ensure page and limit are numbers (query params are strings)
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const { formCode, search, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.FormSubmissionWhereInput = {};

    if (formCode) {
      where.formCode = formCode;
    }

    // Note: SQLite JSON search is limited, we'll skip search filter for now
    // A proper implementation would require full-text search or converting JSON to string
    // For v1.0, we can search by formCode only
    if (search) {
      // Skip JSON search in SQLite for now
      // Future: implement FTS5 or search in specific JSON fields
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.formSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.formSubmission.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    return this.prisma.formSubmission.findUnique({
      where: { id },
    });
  }

  async create(data: CreateFormSubmissionDto) {
    return this.prisma.formSubmission.create({
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.formSubmission.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]) {
    return this.prisma.formSubmission.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  // Get form codes for filter dropdown
  async getFormCodes() {
    const result = await this.prisma.formSubmission.groupBy({
      by: ['formCode'],
      _count: {
        formCode: true,
      },
    });

    return result.map((item) => ({
      code: item.formCode,
      count: item._count.formCode,
    }));
  }
}
