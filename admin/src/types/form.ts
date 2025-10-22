/**
 * Form Types
 * 表单管理相关类型定义
 */

export interface FormConfig {
  id: string
  code: string
  name: string
  description?: string
  fields: FormField[]
  settings: FormSettings
  createdAt: string
  updatedAt?: string
}

export interface FormField {
  name: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file'
  label: string
  placeholder?: string
  required: boolean
  validation?: {
    pattern?: string
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
  }
  options?: Array<{ label: string; value: string }>
  order: number
}

export interface FormSettings {
  submitButtonText: string
  successMessage: string
  errorMessage?: string
  redirectUrl?: string
  emailNotification?: {
    enabled: boolean
    to: string[]
    subject: string
  }
}

export interface FormSubmission {
  id: string
  formCode: string
  formName: string
  data: Record<string, any>
  submittedFrom?: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
}
