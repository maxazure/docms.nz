import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): any {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'docms-api',
      version: '1.0.0',
    };
  }

  getApiInfo(): any {
    return {
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
    };
  }
}