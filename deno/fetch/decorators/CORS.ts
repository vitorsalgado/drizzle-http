import { createFetchDecorator } from '../setupRequestInit.ts'

export function CORS() {
  return createFetchDecorator(CORS, requestInit => (requestInit.mode = 'cors'))
}
