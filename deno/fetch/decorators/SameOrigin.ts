import { createFetchDecorator } from '../setupRequestInit.ts'

export function SameOrigin() {
  return createFetchDecorator(SameOrigin, requestInit => (requestInit.mode = 'same-origin'))
}
