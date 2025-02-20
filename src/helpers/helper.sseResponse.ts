import { SseResponse } from '~/interfaces/sseResponse.interface'
import { randomUUID } from 'node:crypto'

export const sseResponse = (options: SseResponse): SseResponse => {
  options.id = randomUUID()
  options.timestamp = new Date()

  return options
}
