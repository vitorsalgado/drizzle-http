import { createFetchDecorator } from '../setupRequestInit.ts'

export function Mode(mode: RequestMode) {
  return createFetchDecorator(Mode, requestInit => (requestInit.mode = mode))
}
