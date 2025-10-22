import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper methods for clean operations
  async createTestEnvironment() {
    // This method can be used for setting up test data
    // Only available in test environment
    if (process.env.NODE_ENV === 'test') {
      console.log('🧪 Creating test environment...');
    }
  }

  async cleanupTestEnvironment() {
    // This method can be used for cleaning up test data
    // Only available in test environment
    if (process.env.NODE_ENV === 'test') {
      console.log('🧹 Cleaning up test environment...');
    }
  }
}