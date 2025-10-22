import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './common/services/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHealth: jest.fn().mockReturnValue({
              status: 'ok',
              timestamp: '2023-01-01T00:00:00.000Z',
              service: 'docms-api',
              version: '1.0.0',
            }),
            getApiInfo: jest.fn().mockReturnValue({
              name: 'Docms API',
              version: '1.0.0',
              description: 'Docms Backend API - A modern, block-based CMS',
              documentation: '/api/docs',
              endpoints: {
                health: '/',
                apiInfo: '/api',
                auth: '/api/auth',
                users: '/api/users',
                site: '/api/site',
                media: '/api/media',
                menu: '/api/menu',
                pages: '/api/pages',
                posts: '/api/posts',
                products: '/api/products',
                forms: '/api/forms',
                search: '/api/search',
                seo: '/api/seo',
                blocks: '/api/blocks',
              },
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn(),
            $disconnect: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
    prisma = app.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = appController.getHealth();
      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        service: 'docms-api',
        version: '1.0.0',
      });
    });
  });

  describe('getApiInfo', () => {
    it('should return API information', () => {
      const result = appController.getApiInfo();
      expect(result).toEqual({
        name: 'Docms API',
        version: '1.0.0',
        description: 'Docms Backend API - A modern, block-based CMS',
        documentation: '/api/docs',
        endpoints: expect.any(Object),
      });
    });
  });
});