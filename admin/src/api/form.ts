import { http } from '@/utils/request'
import type { FormConfig, FormSubmission, ListResponse } from '@/types'

export function getFormList(): Promise<FormConfig[]> {
  return http.get('/forms')
}

export function getForm(id: string): Promise<FormConfig> {
  return http.get(`/api/forms/${id}`)
}

export function createForm(data: Partial<FormConfig>): Promise<FormConfig> {
  return http.post('/forms', data)
}

export function updateForm(id: string, data: Partial<FormConfig>): Promise<FormConfig> {
  return http.put(`/api/forms/${id}`, data)
}

export function deleteForm(id: string): Promise<void> {
  return http.delete(`/api/forms/${id}`)
}

export function getFormSubmissions(code: string, params?: any): Promise<ListResponse<FormSubmission>> {
  return http.get(`/api/forms/${code}/submissions`, { params })
}
