import { createFetchDecorator } from '../setupRequestInit'

export function Integrity(integrity: string) {
  return createFetchDecorator(Integrity, requestInit => (requestInit.integrity = integrity))
}
