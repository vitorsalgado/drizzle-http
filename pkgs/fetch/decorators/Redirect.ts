import { createFetchDecorator } from '../setupRequestInit'

export function Redirect(redirect: RequestRedirect) {
  return createFetchDecorator(Redirect, requestInit => (requestInit.redirect = redirect))
}
