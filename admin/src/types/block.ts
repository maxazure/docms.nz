// 区块基础类型
export interface Block {
  id: string
  type: string
  props: Record<string, any>
  order: number
  visibility: boolean
}

// 区块类型定义
export interface BlockDefinition {
  type: string
  label: string
  icon: string
  category: 'layout' | 'content' | 'media' | 'form'
  schema: any // JSON Schema
  defaultProps: Record<string, any>
}

// Hero 区块属性
export interface HeroBlockProps {
  title: string
  subtitle?: string
  backgroundImage?: string
  ctaText?: string
  ctaLink?: string
  height?: 'small' | 'medium' | 'large' | 'full'
  textAlign?: 'left' | 'center' | 'right'
}

// 文本区块属性
export interface TextBlockProps {
  content: string
  align?: 'left' | 'center' | 'right'
  maxWidth?: 'narrow' | 'medium' | 'wide' | 'full'
}

// 图片画廊区块属性
export interface ImageGalleryBlockProps {
  images: string[] // Media IDs
  layout?: 'grid' | 'carousel' | 'masonry'
  columns?: 2 | 3 | 4
  aspectRatio?: '1:1' | '4:3' | '16:9'
  clickBehavior?: 'lightbox' | 'none'
}

// 特点区块属性
export interface FeaturesBlockProps {
  items: Array<{
    icon: string
    title: string
    description: string
  }>
  columns?: 2 | 3 | 4
  style?: 'card' | 'icon-text'
}

// CTA 区块属性
export interface CTABlockProps {
  title: string
  description?: string
  buttonText: string
  buttonLink: string
  backgroundColor?: string
  backgroundImage?: string
  layout?: 'center' | 'split'
}

// FAQ 区块属性
export interface FAQBlockProps {
  items: Array<{
    question: string
    answer: string
  }>
  expandMode?: 'single' | 'multiple'
  style?: 'accordion' | 'card'
}

// 产品展示区块属性
export interface ProductShowcaseBlockProps {
  productIds?: string[]
  autoFetch?: boolean
  limit?: number
  layout?: 'carousel' | 'grid'
  showFields?: {
    title?: boolean
    price?: boolean
    image?: boolean
    summary?: boolean
  }
}

// 评价区块属性
export interface TestimonialsBlockProps {
  items: Array<{
    avatar?: string
    name: string
    company?: string
    content: string
    rating?: number
  }>
  layout?: 'card' | 'carousel'
}

// 联系表单区块属性
export interface ContactFormBlockProps {
  formCode: string
  fields: Array<{
    name: string
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select'
    required?: boolean
    placeholder?: string
    options?: string[]
  }>
  submitButtonText?: string
  successMessage?: string
}

// 地图区块属性
export interface MapBlockProps {
  latitude: number
  longitude: number
  zoom?: number
  markerTitle?: string
  markerDescription?: string
  provider?: 'baidu' | 'amap' | 'google'
}

// 视频区块属性
export interface VideoBlockProps {
  source: string // Media ID or URL
  coverImage?: string
  autoPlay?: boolean
  aspectRatio?: '16:9' | '4:3' | '1:1'
}

// 分隔符区块属性
export interface DividerBlockProps {
  style?: 'line' | 'space'
  spacing?: 'small' | 'medium' | 'large'
}
