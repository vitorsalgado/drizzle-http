import { createFetchDecorator } from '../setupRequestInit'

export function Mode(mode: RequestMode) {
  return createFetchDecorator(Mode, requestInit => (requestInit.mode = mode))
}
