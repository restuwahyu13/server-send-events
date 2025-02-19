export enum ESseResponseType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

interface SseResponseContent {
  title: string
  subtitle?: string
  description: string
}

export interface SseResponse {
  id?: string
  icon?: string
  type: ESseResponseType
  content?: SseResponseContent
  error?: string
  timestamp?: Date
}
