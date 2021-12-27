import { createFetchDecorator } from '../setupRequestInit'

export function NoCORS() {
  return createFetchDecorator(NoCORS, requestInit => (requestInit.mode = 'no-cors'))
}
