export interface ApiErrorResponse {
  detail?: string
  non_field_errors?: string[]
  [key: string]: unknown
}

export interface DjangoPaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}