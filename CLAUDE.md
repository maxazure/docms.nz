# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Docms** is a single-site, open-source, self-hosted enterprise CMS currently in the planning phase. This is a documentation-only repository containing comprehensive specifications for the v1.0 implementation.

### Project Status
- **Current Phase**: Planning/Specification Phase
- **Implementation Status**: No code written yet - only documentation exists
- **Primary Goal**: Build a modern, block-based CMS with intuitive admin interface

## Project Structure

This repository currently contains only documentation files:

- `CMS-PRD-v1.0.md` - Comprehensive Product Requirements Document (30KB)
- `CMS-v1.0-Execution-Plan.md` - Detailed AI-assisted implementation plan (11KB)
- `管理后台结构示意图.png` - Admin interface structure diagram (155KB)

## Planned Technology Stack

Based on the PRD documentation, the intended tech stack for implementation is:

### Backend API
- **Framework**: NestJS with Fastify adapter
- **Database**: SQLite with Prisma ORM (WAL mode)
- **Authentication**: JWT with refresh tokens
- **Documentation**: OpenAPI/Swagger auto-generation

### Admin Interface
- **Framework**: Vue 3 + TypeScript
- **UI Library**: Naive UI (can be replaced with Element Plus)
- **Build Tool**: Vite
- **State Management**: Pinia

### Frontend Website
- **Framework**: Nuxt 3 with SSR/SSG
- **Features**: Strong SEO, static generation, CDN optimization
- **Rendering**: Block-based component system

### Deployment
- **Containerization**: Docker Compose
- **Services**: api / admin / nuxt-ssg
- **Storage**: Local `/uploads` initially, S3-compatible storage in v2.0+

## Core Architecture Concepts

### Block-Based Content System
The entire system revolves around a **block-based architecture** where content is composed of reusable blocks:

- Pages are collections of blocks stored as JSON arrays
- Each block has a `type`, `props`, `order`, and `visibility`
- 12 core block types planned for v1.0 (Hero, Text, ImageGallery, Features, CTA, FAQ, etc.)
- Block registry system allows for extensibility in future versions

### Dynamic Navigation System
**Key Design Principle**: "Website sections as primary navigation"

- Left sidebar navigation dynamically generated from menu configuration
- Three main section types: Page (single pages), Post List (articles/news), Product (product catalog)
- Menu items define both admin navigation structure and frontend site navigation
- Intuitive zero-learning-curve admin experience

### Content Models
The system will manage these primary content types:

1. **Pages** - Block-based single pages (Home, About, Contact, Solutions, etc.)
2. **Posts** - Articles with categories, tags, and publishing workflow
3. **Products** - Product catalog with specifications, galleries, and pricing (display-only in v1.0)
4. **Media** - File upload and management system
5. **Forms** - Contact forms with submission management

## Implementation Phases

The execution plan outlines a 5-phase approach:

1. **Phase 0: Baseline Setup** - Development environment, docker-compose base, CI/CD
2. **Phase 1: Backend API** - NestJS application with Prisma models and business logic
3. **Phase 2: API Documentation** - Auto-generated OpenAPI docs and examples
4. **Phase 3: Admin Interface** - Vue3 + Naive UI admin application
5. **Phase 4: Frontend Website** - Nuxt 3 SSG site with SEO optimization
6. **Phase 5: Deployment** - End-to-end testing and production deployment

## Database Schema (Planned)

Key models will include (from PRD section 6):
- **User** - Authentication and role-based access (Owner/Admin/Editor/Author/Viewer)
- **Site** - Single-site configuration with theme tokens
- **MenuItem** - Navigation structure with section types (page/postList/product)
- **Page** - Block-based pages with JSON block storage
- **Post** - Articles with categories, tags, and publishing workflow
- **Product** - Product catalog with specifications and media
- **Media** - File management with metadata
- **FormSubmission** - Contact form entries

## Development Commands

Since no code exists yet, standard commands will need to be established during Phase 0 implementation:

```bash
# Expected commands (to be implemented)
npm run dev              # Start development environment
npm run build            # Build for production
npm run test             # Run test suite
npm run lint             # Code linting
npm run typecheck        # TypeScript validation
docker compose up       # Start full stack with Docker
```

## Key Design Principles

1. **Zero Learning Curve** - Admin interface should be intuitive for business users
2. **Block-Based Everything** - All content composable from reusable blocks
3. **SEO-First** - Frontend optimized for search engines with SSG
4. **Self-Hosted** - Complete data ownership, no multi-tenant concerns
5. **Lightweight** - SQLite backend, minimal server requirements
6. **Extensible** - Plugin system for custom blocks and features (v2.0+)

## Security Considerations

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- File upload validation and MIME type checking
- Rate limiting on forms and login attempts
- Audit logging for important operations

## Next Steps for Implementation

1. Initialize the monorepo structure (api/admin/frontend)
2. Set up docker-compose with the planned services
3. Implement Prisma schema based on the database specifications
4. Begin Phase 1 backend API development following the execution plan

## Notes

- This is a Chinese language project targeting enterprise users
- v1.0 focuses on core CMS functionality without e-commerce or AI features
- All planning documentation is comprehensive and should be referenced during development
- The admin interface structure diagram shows the intended layout and user experience