import { createFetchDecorator } from '../setupRequestInit.ts'

export function KeepAlive(keepAlive: boolean) {
  return createFetchDecorator(KeepAlive, requestInit => (requestInit.keepalive = keepAlive))
}
