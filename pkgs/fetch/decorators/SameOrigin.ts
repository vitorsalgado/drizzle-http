import { createFetchDecorator } from '../setupRequestInit'

export function SameOrigin() {
  return createFetchDecorator(SameOrigin, requestInit => (requestInit.mode = 'same-origin'))
}
