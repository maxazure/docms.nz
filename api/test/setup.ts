import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Setup test database
  console.log('🧪 Setting up test environment...');

  // Clean up existing test data
  await prisma.auditLog.deleteMany();
  await prisma.formSubmission.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.postCategory.deleteMany();
  await prisma.media.deleteMany();
  await prisma.pageVersion.deleteMany();
  await prisma.page.deleteMany();
  await prisma.post.deleteMany();
  await prisma.product.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.site.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  const hashedPassword = await bcrypt.hash('test123', 10);
  await prisma.user.create({
    data: {
      email: 'test@docms.local',
      passwordHash: hashedPassword,
      displayName: 'Test User',
      role: 'OWNER',
    },
  });

  // Create test site
  await prisma.site.create({
    data: {
      name: 'Test Site',
      domain: 'test.local',
      locale: 'zh',
      themeTokens: {
        primaryColor: '#1890ff',
        secondaryColor: '#52c41a',
      },
      settings: {
        siteName: 'Test Site',
        siteDescription: 'Test description',
      },
    },
  });

  console.log('✅ Test environment setup completed');
});

afterAll(async () => {
  // Cleanup after all tests
  await prisma.$disconnect();
  console.log('🧹 Test environment cleaned up');
});

// Helper function for test data
export const createTestUser = async (role = 'VIEWER' as const) => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const randomEmail = `user_${Date.now()}@test.local`;

  return prisma.user.create({
    data: {
      email: randomEmail,
      passwordHash: hashedPassword,
      displayName: `Test User ${Date.now()}`,
      role,
    },
  });
};

export const createTestSite = async (name = 'Test Site') => {
  return prisma.site.create({
    data: {
      name,
      domain: `${name.toLowerCase().replace(/\s+/g, '-')}.local`,
      locale: 'zh',
      themeTokens: {
        primaryColor: '#1890ff',
      },
      settings: {
        siteName: name,
      },
    },
  });
};

export const clearTestData = async () => {
  await prisma.auditLog.deleteMany();
  await prisma.formSubmission.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.postCategory.deleteMany();
  await prisma.media.deleteMany();
  await prisma.pageVersion.deleteMany();
  await prisma.page.deleteMany();
  await prisma.post.deleteMany();
  await prisma.product.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.site.deleteMany();
  await prisma.user.deleteMany();
};