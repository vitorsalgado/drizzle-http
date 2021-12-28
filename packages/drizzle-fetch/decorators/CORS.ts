import { createFetchDecorator } from '../setupRequestInit'

export function CORS() {
  return createFetchDecorator(CORS, requestInit => (requestInit.mode = 'cors'))
}
