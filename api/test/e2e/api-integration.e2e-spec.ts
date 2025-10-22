import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/services/prisma.service';

describe('Docms API Integration Tests (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  // Test tokens
  let adminToken: string;
  let editorToken: string;
  let authorToken: string;
  let viewerToken: string;

  // Test data IDs
  let categoryId: string;
  let tagId: string;
  let postId: string;
  let productId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean database
    await prisma.postTag.deleteMany();
    await prisma.postCategory.deleteMany();
    await prisma.post.deleteMany();
    await prisma.product.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Authentication Module', () => {
    it('POST /auth/register - should register ADMIN user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'Admin123456',
          role: 'ADMIN',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('admin@test.com');
      expect(response.body.user.role).toBe('ADMIN');

      adminToken = response.body.accessToken;
    });

    it('POST /auth/register - should register EDITOR user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'editor@test.com',
          password: 'Editor123456',
          role: 'EDITOR',
        })
        .expect(201);

      editorToken = response.body.accessToken;
    });

    it('POST /auth/register - should register AUTHOR user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'author@test.com',
          password: 'Author123456',
          role: 'AUTHOR',
        })
        .expect(201);

      authorToken = response.body.accessToken;
    });

    it('POST /auth/register - should register VIEWER user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'viewer@test.com',
          password: 'Viewer123456',
          role: 'VIEWER',
        })
        .expect(201);

      viewerToken = response.body.accessToken;
    });

    it('POST /auth/register - should reject duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'Admin123456',
          role: 'ADMIN',
        })
        .expect(400);
    });

    it('POST /auth/login - should login with correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'Admin123456',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('POST /auth/login - should reject wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'WrongPassword',
        })
        .expect(401);
    });

    it('GET /auth/profile - should get user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.email).toBe('admin@test.com');
      expect(response.body.role).toBe('ADMIN');
    });
  });

  describe('2. Category Module', () => {
    it('POST /categories - ADMIN should create category', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '技术教程',
          slug: 'tech-tutorials',
          description: '技术相关教程',
          order: 1,
        })
        .expect(201);

      expect(response.body.name).toBe('技术教程');
      expect(response.body.slug).toBe('tech-tutorials');
      categoryId = response.body.id;
    });

    it('POST /categories - should reject duplicate slug', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '另一个分类',
          slug: 'tech-tutorials',
          order: 2,
        })
        .expect(400);
    });

    it('POST /categories - VIEWER should be forbidden', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          name: '测试分类',
          slug: 'test-category',
        })
        .expect(403);
    });

    it('GET /categories - should get all categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('GET /categories/tree - should get category tree', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories/tree')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /categories/:id - should get category by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .expect(200);

      expect(response.body.id).toBe(categoryId);
    });

    it('PUT /categories/:id - should update category', async () => {
      const response = await request(app.getHttpServer())
        .put(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '技术教程更新',
        })
        .expect(200);

      expect(response.body.name).toBe('技术教程更新');
    });
  });

  describe('3. Tag Module', () => {
    it('POST /tags - EDITOR should create tag', async () => {
      const response = await request(app.getHttpServer())
        .post('/tags')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          name: '水培技术',
          slug: 'hydroponics',
        })
        .expect(201);

      expect(response.body.name).toBe('水培技术');
      tagId = response.body.id;
    });

    it('POST /tags - should reject duplicate slug', async () => {
      await request(app.getHttpServer())
        .post('/tags')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          name: '另一个标签',
          slug: 'hydroponics',
        })
        .expect(400);
    });

    it('GET /tags - should get all tags', async () => {
      const response = await request(app.getHttpServer())
        .get('/tags')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /tags?search=水培 - should search tags', async () => {
      const response = await request(app.getHttpServer())
        .get('/tags?search=水培')
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].name).toContain('水培');
    });
  });

  describe('4. Post Module', () => {
    it('POST /posts - AUTHOR should create post', async () => {
      const response = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          title: '水培技术入门指南',
          slug: 'hydroponics-guide',
          summary: '了解水培种植的基础知识',
          content: { type: 'html', data: '<p>文章内容...</p>' },
          status: 'DRAFT',
          categoryIds: [categoryId],
          tagIds: [tagId],
        })
        .expect(201);

      expect(response.body.title).toBe('水培技术入门指南');
      expect(response.body.status).toBe('DRAFT');
      postId = response.body.id;
    });

    it('POST /posts - VIEWER should be forbidden', async () => {
      await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          title: '测试文章',
          slug: 'test-post',
          content: { type: 'html', data: '<p>内容</p>' },
        })
        .expect(403);
    });

    it('GET /posts - should get all posts', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
    });

    it('GET /posts?search=水培 - should search posts', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts?search=水培')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('GET /posts/:id - should get post by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/posts/${postId}`)
        .expect(200);

      expect(response.body.id).toBe(postId);
      expect(response.body).toHaveProperty('postCategories');
      expect(response.body).toHaveProperty('postTags');
    });

    it('PATCH /posts/:id - AUTHOR should update own post', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/posts/${postId}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          title: '水培技术入门指南 - 更新版',
        })
        .expect(200);

      expect(response.body.title).toBe('水培技术入门指南 - 更新版');
    });

    it('PATCH /posts/:id - EDITOR should not update others post', async () => {
      await request(app.getHttpServer())
        .patch(`/posts/${postId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: '尝试修改',
        })
        .expect(403);
    });

    it('POST /posts/:id/publish - AUTHOR should be forbidden', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${postId}/publish`)
        .set('Authorization', `Bearer ${authorToken}`)
        .expect(403);
    });

    it('POST /posts/:id/publish - ADMIN should publish post', async () => {
      const response = await request(app.getHttpServer())
        .post(`/posts/${postId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('PUBLISHED');
      expect(response.body.publishedAt).toBeDefined();
    });

    it('POST /posts/:id/publish - should reject already published post', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${postId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('5. Product Module', () => {
    it('POST /products - EDITOR should create product', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          name: '智能水培系统 Pro',
          slug: 'smart-hydroponic-pro',
          summary: '专业级智能水培种植系统',
          specs: {
            size: '120x60x180cm',
            capacity: '48 plants',
            power: '200W',
          },
          price: 2999.0,
          categoryId: categoryId,
          tagIds: [tagId],
        })
        .expect(201);

      expect(response.body.name).toBe('智能水培系统 Pro');
      expect(response.body.price).toBe(2999.0);
      productId = response.body.id;
    });

    it('POST /products - AUTHOR should be forbidden', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          name: '测试产品',
          slug: 'test-product',
        })
        .expect(403);
    });

    it('GET /products - should get all products', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('GET /products?minPrice=2000&maxPrice=3000 - should filter by price', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?minPrice=2000&maxPrice=3000')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(2000);
        expect(product.price).toBeLessThanOrEqual(3000);
      });
    });

    it('GET /products/:id - should get product by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200);

      expect(response.body.id).toBe(productId);
      expect(response.body).toHaveProperty('category');
    });

    it('POST /products/:id/toggle-active - EDITOR should be forbidden', async () => {
      await request(app.getHttpServer())
        .post(`/products/${productId}/toggle-active`)
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(403);
    });

    it('POST /products/:id/toggle-active - ADMIN should toggle active', async () => {
      const response = await request(app.getHttpServer())
        .post(`/products/${productId}/toggle-active`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.isActive).toBe(false);
    });
  });

  describe('6. Permissions Module', () => {
    it('GET /permissions - should get all permissions', async () => {
      const response = await request(app.getHttpServer())
        .get('/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /permissions/hierarchy - should get permission hierarchy', async () => {
      const response = await request(app.getHttpServer())
        .get('/permissions/hierarchy')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('OWNER');
      expect(response.body).toHaveProperty('ADMIN');
    });
  });

  describe('7. Blocks Module', () => {
    it('GET /blocks/types - should get all block types', async () => {
      const response = await request(app.getHttpServer())
        .get('/blocks/types')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(12);
    });

    it('POST /blocks/validate - should validate block data', async () => {
      const response = await request(app.getHttpServer())
        .post('/blocks/validate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'Hero',
          props: {
            title: '欢迎使用水培系统',
            subtitle: '智能化种植解决方案',
          },
        })
        .expect(200);

      expect(response.body.valid).toBe(true);
    });
  });
});
