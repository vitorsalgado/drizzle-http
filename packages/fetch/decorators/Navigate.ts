import { createFetchDecorator } from '../setupRequestInit'

export function Navigate() {
  return createFetchDecorator(Navigate, requestInit => (requestInit.mode = 'navigate'))
}
