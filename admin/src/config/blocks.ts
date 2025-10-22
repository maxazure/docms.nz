/**
 * Block Registry
 * 区块注册系统 - 定义所有可用的区块类型
 */

import type { BlockDefinition } from '@/types'

export const blockRegistry: BlockDefinition[] = [
  {
    type: 'hero',
    label: 'Hero 横幅',
    icon: 'image',
    category: 'layout',
    schema: {},
    defaultProps: {
      title: '欢迎来到我们的网站',
      subtitle: '提供专业的解决方案',
      backgroundImage: '',
      ctaText: '了解更多',
      ctaLink: '',
      height: 'large',
      textAlign: 'center'
    }
  },
  {
    type: 'text',
    label: '文本区块',
    icon: 'document-text',
    category: 'content',
    schema: {},
    defaultProps: {
      content: '<p>在此输入文本内容...</p>',
      align: 'left',
      maxWidth: 'medium'
    }
  },
  {
    type: 'imageGallery',
    label: '图片画廊',
    icon: 'images',
    category: 'media',
    schema: {},
    defaultProps: {
      images: [],
      layout: 'grid',
      columns: 3,
      aspectRatio: '16:9',
      clickBehavior: 'lightbox'
    }
  },
  {
    type: 'features',
    label: '特点展示',
    icon: 'grid',
    category: 'content',
    schema: {},
    defaultProps: {
      items: [
        { icon: 'checkmark-circle', title: '特点1', description: '描述文本' },
        { icon: 'checkmark-circle', title: '特点2', description: '描述文本' },
        { icon: 'checkmark-circle', title: '特点3', description: '描述文本' }
      ],
      columns: 3,
      style: 'card'
    }
  },
  {
    type: 'cta',
    label: 'CTA 行动号召',
    icon: 'megaphone',
    category: 'content',
    schema: {},
    defaultProps: {
      title: '准备开始了吗？',
      description: '立即联系我们获取专业咨询',
      buttonText: '立即咨询',
      buttonLink: '/contact',
      backgroundColor: '#f0f0f0',
      backgroundImage: '',
      layout: 'center'
    }
  },
  {
    type: 'faq',
    label: 'FAQ 常见问题',
    icon: 'help-circle',
    category: 'content',
    schema: {},
    defaultProps: {
      items: [
        { question: '问题1', answer: '答案1' },
        { question: '问题2', answer: '答案2' }
      ],
      expandMode: 'single',
      style: 'accordion'
    }
  },
  {
    type: 'productShowcase',
    label: '产品展示',
    icon: 'cube',
    category: 'content',
    schema: {},
    defaultProps: {
      productIds: [],
      autoFetch: true,
      limit: 6,
      layout: 'grid',
      showFields: {
        title: true,
        price: true,
        image: true,
        summary: true
      }
    }
  },
  {
    type: 'testimonials',
    label: '客户评价',
    icon: 'chatbubbles',
    category: 'content',
    schema: {},
    defaultProps: {
      items: [
        {
          avatar: '',
          name: '张三',
          company: '某公司',
          content: '非常好的产品和服务！',
          rating: 5
        }
      ],
      layout: 'card'
    }
  },
  {
    type: 'contactForm',
    label: '联系表单',
    icon: 'mail',
    category: 'form',
    schema: {},
    defaultProps: {
      formCode: 'contact',
      fields: [
        { name: 'name', type: 'text', required: true, placeholder: '姓名' },
        { name: 'email', type: 'email', required: true, placeholder: '邮箱' },
        { name: 'message', type: 'textarea', required: true, placeholder: '留言' }
      ],
      submitButtonText: '提交',
      successMessage: '提交成功，我们会尽快联系您！'
    }
  },
  {
    type: 'map',
    label: '地图',
    icon: 'location',
    category: 'content',
    schema: {},
    defaultProps: {
      latitude: 39.9042,
      longitude: 116.4074,
      zoom: 15,
      markerTitle: '我们的位置',
      markerDescription: '',
      provider: 'amap'
    }
  },
  {
    type: 'video',
    label: '视频',
    icon: 'videocam',
    category: 'media',
    schema: {},
    defaultProps: {
      source: '',
      coverImage: '',
      autoPlay: false,
      aspectRatio: '16:9'
    }
  },
  {
    type: 'divider',
    label: '分隔符',
    icon: 'remove',
    category: 'layout',
    schema: {},
    defaultProps: {
      style: 'line',
      spacing: 'medium'
    }
  }
]

/**
 * Get block definition by type
 */
export function getBlockDefinition(type: string): BlockDefinition | undefined {
  return blockRegistry.find(block => block.type === type)
}

/**
 * Get blocks by category
 */
export function getBlocksByCategory(category: string): BlockDefinition[] {
  return blockRegistry.filter(block => block.category === category)
}

/**
 * Get all block categories
 */
export function getBlockCategories(): string[] {
  return Array.from(new Set(blockRegistry.map(block => block.category)))
}
