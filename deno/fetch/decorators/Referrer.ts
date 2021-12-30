import { createFetchDecorator } from '../setupRequestInit.ts'

export function Referrer(referrer: string) {
  return createFetchDecorator(Referrer, requestInit => (requestInit.referrer = referrer))
}
