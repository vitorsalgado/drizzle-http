import { createFetchDecorator } from '../setupRequestInit.ts'

export function Navigate() {
  return createFetchDecorator(Navigate, requestInit => (requestInit.mode = 'navigate'))
}
