import { createFetchDecorator } from '../setupRequestInit.ts'

export function Integrity(integrity: string) {
  return createFetchDecorator(Integrity, requestInit => (requestInit.integrity = integrity))
}
