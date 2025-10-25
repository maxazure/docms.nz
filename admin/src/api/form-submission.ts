import { http } from '@/utils/request'

export interface FormSubmission {
  id: string
  formCode: string
  payload: Record<string, any>
  ip?: string
  ua?: string
  spamScore?: number
  createdAt: string
}

export interface FormSubmissionListQuery {
  page?: number
  limit?: number
  formCode?: string
  search?: string
  startDate?: string
  endDate?: string
}

export interface FormSubmissionListResponse {
  data: FormSubmission[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface FormCode {
  code: string
  count: number
}

// Get form submission list
export async function getFormSubmissionList(
  query?: FormSubmissionListQuery
): Promise<FormSubmissionListResponse> {
  const response = await http.get<FormSubmissionListResponse>('/form-submissions', { params: query })
  return response.data as any
}

// Get form submission detail
export async function getFormSubmission(id: string): Promise<FormSubmission> {
  const response = await http.get<FormSubmission>(`/form-submissions/${id}`)
  return response.data as any
}

// Delete form submission
export async function deleteFormSubmission(id: string): Promise<void> {
  await http.delete(`/form-submissions/${id}`)
}

// Batch delete form submissions
export async function batchDeleteFormSubmissions(ids: string[]): Promise<void> {
  await http.post('/form-submissions/batch-delete', { ids })
}

// Get form codes for filter
export async function getFormCodes(): Promise<FormCode[]> {
  const response = await http.get<FormCode[]>('/form-submissions/form-codes')
  return response.data as any
}
