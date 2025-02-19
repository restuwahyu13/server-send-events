import { SseResponse } from '~/interfaces/sseResponse.interface'

export const sseResponse = (options: SseResponse): SseResponse => {
  options.timestamp = new Date()
  return options
}
