import { createFetchDecorator } from '../setupRequestInit'

export function KeepAlive(keepAlive: boolean) {
  return createFetchDecorator(KeepAlive, requestInit => (requestInit.keepalive = keepAlive))
}
