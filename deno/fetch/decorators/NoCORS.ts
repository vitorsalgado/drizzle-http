import { createFetchDecorator } from '../setupRequestInit.ts'

export function NoCORS() {
  return createFetchDecorator(NoCORS, requestInit => (requestInit.mode = 'no-cors'))
}
