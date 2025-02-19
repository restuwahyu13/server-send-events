export interface ApiResponse {
  stat_code: number
  message?: string
  err_code?: string
  error?: any
  errors?: any
  data?: any
  pagination?: Record<string, any>
}
