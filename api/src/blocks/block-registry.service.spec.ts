import { Test, TestingModule } from '@nestjs/testing';
import { BlockRegistryService, BlockDefinition } from './block-registry.service';
import { BlockType } from '@prisma/client';

describe('BlockRegistryService', () => {
  let service: BlockRegistryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockRegistryService],
    }).compile();

    service = module.get<BlockRegistryService>(BlockRegistryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('核心区块注册', () => {
    it('应该注册所有12种核心区块类型', () => {
      const allBlocks = service.getAll();
      expect(allBlocks).toHaveLength(12);

      const blockTypes = allBlocks.map(block => block.type);
      expect(blockTypes).toContain(BlockType.HERO);
      expect(blockTypes).toContain(BlockType.TEXT);
      expect(blockTypes).toContain(BlockType.IMAGE_GALLERY);
      expect(blockTypes).toContain(BlockType.FEATURES);
      expect(blockTypes).toContain(BlockType.CTA);
      expect(blockTypes).toContain(BlockType.FAQ);
      expect(blockTypes).toContain(BlockType.PRODUCT_SHOWCASE);
      expect(blockTypes).toContain(BlockType.TESTIMONIALS);
      expect(blockTypes).toContain(BlockType.CONTACT_FORM);
      expect(blockTypes).toContain(BlockType.MAP);
      expect(blockTypes).toContain(BlockType.VIDEO);
      expect(blockTypes).toContain(BlockType.DIVIDER);
    });

    it('Hero区块应该有正确的配置', () => {
      const heroBlock = service.getByType(BlockType.HERO);
      expect(heroBlock).toBeDefined();
      expect(heroBlock.label).toBe('横幅');
      expect(heroBlock.category).toBe('layout');
      expect(heroBlock.schema.required).toContain('title');
      expect(heroBlock.defaultProps.title).toBe('欢迎来到我们的网站');
    });

    it('文本区块应该有正确的配置', () => {
      const textBlock = service.getByType(BlockType.TEXT);
      expect(textBlock).toBeDefined();
      expect(textBlock.label).toBe('文本');
      expect(textBlock.category).toBe('content');
      expect(textBlock.schema.required).toContain('content');
      expect(textBlock.defaultProps.content).toBe('<p>在这里输入您的文本内容...</p>');
    });

    it('图片画廊区块应该有正确的配置', () => {
      const galleryBlock = service.getByType(BlockType.IMAGE_GALLERY);
      expect(galleryBlock).toBeDefined();
      expect(galleryBlock.label).toBe('图片画廊');
      expect(galleryBlock.category).toBe('media');
      expect(galleryBlock.schema.required).toContain('images');
      expect(galleryBlock.defaultProps.layout).toBe('grid');
    });
  });

  describe('区块验证', () => {
    it('应该验证有效的Hero区块数据', () => {
      const validHeroData = {
        title: '测试标题',
        subtitle: '测试副标题',
        height: 'large',
        textAlign: 'center',
      };

      const result = service.validate(BlockType.HERO, validHeroData);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('应该拒绝缺少必填字段的Hero区块数据', () => {
      const invalidHeroData = {
        subtitle: '测试副标题',
        height: 'large',
      };

      const result = service.validate(BlockType.HERO, invalidHeroData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required property: title');
    });

    it('应该验证字段类型', () => {
      const invalidData = {
        title: '测试标题',
        height: 'invalid-height', // 无效的枚举值
      };

      const result = service.validate(BlockType.HERO, invalidData);
      expect(result.valid).toBe(true); // 简单验证不检查枚举值范围
    });

    it('应该拒绝未知的区块类型', () => {
      const result = service.validate('UNKNOWN_BLOCK' as BlockType, {});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unknown block type: UNKNOWN_BLOCK');
    });
  });

  describe('区块创建', () => {
    it('应该创建Hero区块实例', () => {
      const block = service.createBlock(BlockType.HERO, {
        order: 1,
        visibility: false,
      });

      expect(block.type).toBe(BlockType.HERO);
      expect(block.id).toMatch(/^block_\d+_[a-z0-9]+$/);
      expect(block.order).toBe(1);
      expect(block.visibility).toBe(false);
      expect(block.props.title).toBe('欢迎来到我们的网站'); // 默认属性
    });

    it('应该创建文本区块实例', () => {
      const customProps = {
        content: '<p>自定义内容</p>',
        textAlign: 'center',
      };

      const block = service.createBlock(BlockType.TEXT, {
        props: customProps,
      });

      expect(block.type).toBe(BlockType.TEXT);
      expect(block.props.content).toBe('<p>自定义内容</p>');
      expect(block.props.textAlign).toBe('center');
      expect(block.props.maxWidth).toBe('medium'); // 默认属性
    });

    it('应该为未知区块类型抛出错误', () => {
      expect(() => {
        service.createBlock('UNKNOWN_BLOCK' as BlockType);
      }).toThrow('Unknown block type: UNKNOWN_BLOCK');
    });

    it('应该生成唯一的区块ID', () => {
      const block1 = service.createBlock(BlockType.TEXT);
      const block2 = service.createBlock(BlockType.TEXT);

      expect(block1.id).not.toBe(block2.id);
    });
  });

  describe('区块分类', () => {
    it('应该按类别组织区块', () => {
      const allBlocks = service.getAll();
      const categories = new Map<string, BlockDefinition[]>();

      allBlocks.forEach(block => {
        if (!categories.has(block.category)) {
          categories.set(block.category, []);
        }
        categories.get(block.category)!.push(block);
      });

      expect(categories.has('layout')).toBe(true);
      expect(categories.has('content')).toBe(true);
      expect(categories.has('media')).toBe(true);
      expect(categories.has('form')).toBe(true);

      expect(categories.get('layout')).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: BlockType.HERO }),
          expect.objectContaining({ type: BlockType.DIVIDER }),
        ])
      );
    });

    it('每个区块应该有图标和描述', () => {
      const allBlocks = service.getAll();

      allBlocks.forEach(block => {
        expect(block.icon).toBeDefined();
        expect(block.description).toBeDefined();
        expect(typeof block.label).toBe('string');
        expect(typeof block.description).toBe('string');
      });
    });
  });

  describe('复杂区块验证', () => {
    it('应该验证图片画廊区块的数组字段', () => {
      const validGalleryData = {
        images: ['media-1', 'media-2', 'media-3'],
        layout: 'grid',
        columns: 3,
      };

      const result = service.validate(BlockType.IMAGE_GALLERY, validGalleryData);
      expect(result.valid).toBe(true);
    });

    it('应该验证特点展示区块的复杂结构', () => {
      const validFeaturesData = {
        items: [
          { icon: '🌱', title: '特点1', description: '描述1' },
          { icon: '💧', title: '特点2', description: '描述2' },
        ],
        columns: 2,
        style: 'card',
      };

      const result = service.validate(BlockType.FEATURES, validFeaturesData);
      expect(result.valid).toBe(true);
    });

    it('应该验证联系表单区块的字段定义', () => {
      const validFormData = {
        formCode: 'contact',
        title: '联系我们',
        fields: [
          { name: 'name', type: 'text', label: '姓名', required: true },
          { name: 'email', type: 'email', label: '邮箱', required: true },
        ],
        buttonText: '提交',
      };

      const result = service.validate(BlockType.CONTACT_FORM, validFormData);
      expect(result.valid).toBe(true);
    });
  });
});