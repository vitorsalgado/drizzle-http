import { createFetchDecorator } from '../setupRequestInit.ts'

export function Redirect(redirect: RequestRedirect) {
  return createFetchDecorator(Redirect, requestInit => (requestInit.redirect = redirect))
}
