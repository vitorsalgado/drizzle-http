import { createFetchDecorator } from '../setupRequestInit'

export function Referrer(referrer: string) {
  return createFetchDecorator(Referrer, requestInit => (requestInit.referrer = referrer))
}
