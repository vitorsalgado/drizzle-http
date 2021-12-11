import { setupRequestInit } from '../setupRequestInit'

export function Redirect(redirect: RequestRedirect) {
  return function (target: object, method: string): void {
    setupRequestInit(target, method, requestInit => (requestInit.redirect = redirect))
  }
}
