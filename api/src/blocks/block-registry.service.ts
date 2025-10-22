import { Injectable } from '@nestjs/common';
import { BlockType } from '@prisma/client';

export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: string;
  category: 'layout' | 'content' | 'media' | 'form' | 'advanced';
  description: string;
  schema: any; // JSON Schema for validation
  defaultProps: any;
}

export interface Block {
  id: string;
  type: BlockType;
  props: any;
  order: number;
  visibility: boolean;
}

@Injectable()
export class BlockRegistryService {
  private blocks: Map<BlockType, BlockDefinition> = new Map();

  constructor() {
    this.registerCoreBlocks();
  }

  /**
   * Register a new block type
   */
  register(definition: BlockDefinition): void {
    this.blocks.set(definition.type, definition);
  }

  /**
   * Get all registered block types
   */
  getAll(): BlockDefinition[] {
    return Array.from(this.blocks.values());
  }

  /**
   * Get block definition by type
   */
  getByType(type: BlockType): BlockDefinition | undefined {
    return this.blocks.get(type);
  }

  /**
   * Validate block data against its schema
   */
  validate(type: BlockType, props: any): { valid: boolean; errors?: string[] } {
    const definition = this.blocks.get(type);

    if (!definition) {
      return { valid: false, errors: [`Unknown block type: ${type}`] };
    }

    // Simple validation for required properties
    const errors: string[] = [];
    const schema = definition.schema;

    if (schema.required) {
      for (const requiredProp of schema.required) {
        if (!(requiredProp in props)) {
          errors.push(`Missing required property: ${requiredProp}`);
        }
      }
    }

    // Type validation
    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (props[propName] !== undefined) {
          const value = props[propName];
          const propDef = propSchema as any;

          if (propDef.type === 'string' && typeof value !== 'string') {
            errors.push(`Property ${propName} must be a string`);
          }
          if (propDef.type === 'number' && typeof value !== 'number') {
            errors.push(`Property ${propName} must be a number`);
          }
          if (propDef.type === 'boolean' && typeof value !== 'boolean') {
            errors.push(`Property ${propName} must be a boolean`);
          }
          if (propDef.type === 'array' && !Array.isArray(value)) {
            errors.push(`Property ${propName} must be an array`);
          }
          if (propDef.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
            errors.push(`Property ${propName} must be an object`);
          }
        }
      }
    }

    return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  }

  /**
   * Create a new block instance with default properties
   */
  createBlock(type: BlockType, overrides: Partial<Block> = {}): Block {
    const definition = this.blocks.get(type);

    if (!definition) {
      throw new Error(`Unknown block type: ${type}`);
    }

    return {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      props: { ...definition.defaultProps, ...overrides.props },
      order: overrides.order || 0,
      visibility: overrides.visibility !== undefined ? overrides.visibility : true,
    };
  }

  /**
   * Register core block types as defined in PRD
   */
  private registerCoreBlocks(): void {
    // 1. Hero 横幅区块
    this.register({
      type: BlockType.HERO,
      label: '横幅',
      icon: '🎯',
      category: 'layout',
      description: '页面顶部大图横幅，支持标题、副标题、背景图片和行动按钮',
      schema: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', description: '主标题' },
          subtitle: { type: 'string', description: '副标题' },
          backgroundImage: { type: 'string', description: '背景图片媒体ID' },
          ctaText: { type: 'string', description: '按钮文字' },
          ctaLink: { type: 'string', description: '按钮链接' },
          height: { type: 'string', enum: ['small', 'medium', 'large', 'full'], default: 'large' },
          textAlign: { type: 'string', enum: ['left', 'center', 'right'], default: 'center' },
        },
      },
      defaultProps: {
        title: '欢迎来到我们的网站',
        subtitle: '专业的解决方案提供商',
        height: 'large',
        textAlign: 'center',
      },
    });

    // 2. 文本区块
    this.register({
      type: BlockType.TEXT,
      label: '文本',
      icon: '📝',
      category: 'content',
      description: '富文本内容，支持段落、标题、列表等格式',
      schema: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', description: '富文本内容（HTML或Markdown）' },
          textAlign: { type: 'string', enum: ['left', 'center', 'right'], default: 'left' },
          maxWidth: { type: 'string', enum: ['narrow', 'medium', 'wide', 'full'], default: 'medium' },
        },
      },
      defaultProps: {
        content: '<p>在这里输入您的文本内容...</p>',
        textAlign: 'left',
        maxWidth: 'medium',
      },
    });

    // 3. 图片组/画廊区块
    this.register({
      type: BlockType.IMAGE_GALLERY,
      label: '图片画廊',
      icon: '🖼️',
      category: 'media',
      description: '多图展示，支持网格、轮播、瀑布流等布局',
      schema: {
        type: 'object',
        required: ['images'],
        properties: {
          images: { type: 'array', items: { type: 'string' }, description: '图片媒体ID数组' },
          layout: { type: 'string', enum: ['grid', 'carousel', 'masonry'], default: 'grid' },
          columns: { type: 'number', enum: [2, 3, 4], default: 3 },
          aspectRatio: { type: 'string', enum: ['1:1', '4:3', '16:9'], default: '16:9' },
          clickBehavior: { type: 'string', enum: ['lightbox', 'none'], default: 'lightbox' },
        },
      },
      defaultProps: {
        images: [],
        layout: 'grid',
        columns: 3,
        aspectRatio: '16:9',
        clickBehavior: 'lightbox',
      },
    });

    // 4. 特点/要点区块
    this.register({
      type: BlockType.FEATURES,
      label: '特点展示',
      icon: '⭐',
      category: 'content',
      description: '产品特点、服务优势等卡片式展示',
      schema: {
        type: 'object',
        required: ['items'],
        properties: {
          items: {
            type: 'array',
            description: '特点列表',
            items: {
              type: 'object',
              properties: {
                icon: { type: 'string', description: '图标' },
                title: { type: 'string', description: '标题' },
                description: { type: 'string', description: '描述' },
              },
            },
          },
          columns: { type: 'number', enum: [2, 3, 4], default: 3 },
          style: { type: 'string', enum: ['card', 'icon-text'], default: 'card' },
        },
      },
      defaultProps: {
        items: [
          { icon: '🌱', title: '专业团队', description: '经验丰富的专业团队' },
          { icon: '💧', title: '优质服务', description: '贴心周到的客户服务' },
          { icon: '📱', title: '技术领先', description: '采用最新技术解决方案' },
        ],
        columns: 3,
        style: 'card',
      },
    });

    // 5. CTA 行动号召区块
    this.register({
      type: BlockType.CTA,
      label: '行动号召',
      icon: '📢',
      category: 'content',
      description: '引导用户采取行动的宣传区域',
      schema: {
        type: 'object',
        required: ['title', 'buttonText'],
        properties: {
          title: { type: 'string', description: '标题' },
          description: { type: 'string', description: '描述文字' },
          buttonText: { type: 'string', description: '按钮文字' },
          buttonLink: { type: 'string', description: '按钮链接' },
          backgroundColor: { type: 'string', description: '背景颜色' },
          backgroundImage: { type: 'string', description: '背景图片' },
          layout: { type: 'string', enum: ['center', 'left-right'], default: 'center' },
        },
      },
      defaultProps: {
        title: '准备好开始了吗？',
        description: '立即联系我们，获取专业咨询',
        buttonText: '联系我们',
        buttonLink: '/contact',
        backgroundColor: '#007bff',
        layout: 'center',
      },
    });

    // 6. FAQ 常见问题区块
    this.register({
      type: BlockType.FAQ,
      label: '常见问题',
      icon: '❓',
      category: 'content',
      description: '折叠式问答列表',
      schema: {
        type: 'object',
        required: ['items'],
        properties: {
          items: {
            type: 'array',
            description: '问答列表',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string', description: '问题' },
                answer: { type: 'string', description: '答案' },
              },
            },
          },
          expandMode: { type: 'string', enum: ['single', 'multiple'], default: 'single' },
          style: { type: 'string', enum: ['accordion', 'card'], default: 'accordion' },
        },
      },
      defaultProps: {
        items: [
          { question: '如何开始使用？', answer: '您可以立即注册账户开始使用我们的服务。' },
          { question: '支持哪些支付方式？', answer: '我们支持多种支付方式，包括银行转账、信用卡等。' },
        ],
        expandMode: 'single',
        style: 'accordion',
      },
    });

    // 7. 产品展示区块
    this.register({
      type: BlockType.PRODUCT_SHOWCASE,
      label: '产品展示',
      icon: '📦',
      category: 'content',
      description: '在其他页面展示产品',
      schema: {
        type: 'object',
        required: [],
        properties: {
          productIds: { type: 'array', items: { type: 'string' }, description: '指定产品ID列表' },
          autoProducts: { type: 'boolean', description: '自动获取产品', default: false },
          limit: { type: 'number', description: '显示数量限制', default: 6 },
          layout: { type: 'string', enum: ['carousel', 'grid'], default: 'grid' },
          showFields: {
            type: 'array',
            items: { type: 'string' },
            description: '显示字段',
            default: ['title', 'price', 'image', 'summary'],
          },
        },
      },
      defaultProps: {
        autoProducts: true,
        limit: 6,
        layout: 'grid',
        showFields: ['title', 'price', 'image', 'summary'],
      },
    });

    // 8. 客户评价/案例区块
    this.register({
      type: BlockType.TESTIMONIALS,
      label: '客户评价',
      icon: '💬',
      category: 'content',
      description: '展示客户反馈和评价',
      schema: {
        type: 'object',
        required: ['items'],
        properties: {
          items: {
            type: 'array',
            description: '评价列表',
            items: {
              type: 'object',
              properties: {
                avatar: { type: 'string', description: '头像媒体ID' },
                name: { type: 'string', description: '姓名' },
                company: { type: 'string', description: '公司' },
                content: { type: 'string', description: '评价内容' },
                rating: { type: 'number', minimum: 1, maximum: 5, description: '评分' },
              },
            },
          },
          layout: { type: 'string', enum: ['card', 'carousel'], default: 'card' },
          showRating: { type: 'boolean', default: true },
        },
      },
      defaultProps: {
        items: [
          {
            name: '张先生',
            company: '科技有限公司',
            content: '非常专业的服务，解决了我们的实际问题。',
            rating: 5,
          },
        ],
        layout: 'card',
        showRating: true,
      },
    });

    // 9. 联系表单区块
    this.register({
      type: BlockType.CONTACT_FORM,
      label: '联系表单',
      icon: '📋',
      category: 'form',
      description: '嵌入页面的联系表单',
      schema: {
        type: 'object',
        required: ['formCode'],
        properties: {
          formCode: { type: 'string', description: '表单代码' },
          title: { type: 'string', description: '表单标题' },
          description: { type: 'string', description: '表单描述' },
          fields: {
            type: 'array',
            description: '表单字段定义',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: '字段名' },
                type: { type: 'string', enum: ['text', 'email', 'tel', 'textarea', 'select'] },
                label: { type: 'string', description: '标签' },
                placeholder: { type: 'string', description: '占位符' },
                required: { type: 'boolean', description: '必填' },
              },
            },
          },
          buttonText: { type: 'string', description: '提交按钮文字', default: '提交' },
          successMessage: { type: 'string', description: '成功提示' },
        },
      },
      defaultProps: {
        formCode: 'contact',
        title: '联系我们',
        description: '有任何问题请随时联系我们',
        fields: [
          { name: 'name', type: 'text', label: '姓名', placeholder: '请输入您的姓名', required: true },
          { name: 'email', type: 'email', label: '邮箱', placeholder: '请输入您的邮箱', required: true },
          { name: 'message', type: 'textarea', label: '留言', placeholder: '请输入您的留言', required: true },
        ],
        buttonText: '提交',
        successMessage: '感谢您的留言，我们会尽快回复！',
      },
    });

    // 10. 地图区块
    this.register({
      type: BlockType.MAP,
      label: '地图',
      icon: '🗺️',
      category: 'media',
      description: '嵌入地图显示位置',
      schema: {
        type: 'object',
        required: ['latitude', 'longitude'],
        properties: {
          latitude: { type: 'number', description: '纬度' },
          longitude: { type: 'number', description: '经度' },
          zoom: { type: 'number', minimum: 1, maximum: 20, default: 15, description: '缩放级别' },
          marker: {
            type: 'object',
            description: '标记点信息',
            properties: {
              title: { type: 'string', description: '标记标题' },
              description: { type: 'string', description: '标记描述' },
            },
          },
          provider: { type: 'string', enum: ['baidu', 'amap', 'google'], default: 'baidu' },
          height: { type: 'string', enum: ['small', 'medium', 'large'], default: 'medium' },
        },
      },
      defaultProps: {
        latitude: 39.9042,
        longitude: 116.4074,
        zoom: 15,
        provider: 'baidu',
        height: 'medium',
      },
    });

    // 11. 视频区块
    this.register({
      type: BlockType.VIDEO,
      label: '视频',
      icon: '🎬',
      category: 'media',
      description: '嵌入视频内容',
      schema: {
        type: 'object',
        required: ['source'],
        properties: {
          source: { type: 'string', description: '视频源（媒体ID或URL）' },
          sourceType: { type: 'string', enum: ['upload', 'youtube', 'vimeo', 'custom'], default: 'upload' },
          coverImage: { type: 'string', description: '封面图片' },
          autoplay: { type: 'boolean', default: false },
          aspectRatio: { type: 'string', enum: ['16:9', '4:3', '1:1'], default: '16:9' },
          controls: { type: 'boolean', default: true },
        },
      },
      defaultProps: {
        sourceType: 'upload',
        autoplay: false,
        aspectRatio: '16:9',
        controls: true,
      },
    });

    // 12. 分隔符区块
    this.register({
      type: BlockType.DIVIDER,
      label: '分隔符',
      icon: '➖',
      category: 'layout',
      description: '视觉分隔元素',
      schema: {
        type: 'object',
        properties: {
          style: { type: 'string', enum: ['line', 'space'], default: 'line' },
          thickness: { type: 'number', minimum: 1, maximum: 10, default: 1 },
          color: { type: 'string', description: '线条颜色', default: '#e0e0e0' },
          spacing: { type: 'string', enum: ['small', 'medium', 'large'], default: 'medium' },
        },
      },
      defaultProps: {
        style: 'line',
        thickness: 1,
        color: '#e0e0e0',
        spacing: 'medium',
      },
    });
  }
}