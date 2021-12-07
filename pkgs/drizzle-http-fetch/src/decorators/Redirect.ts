import { provideRequestInit } from '../provideRequestInit'

export function Redirect(redirect: RequestRedirect) {
  return function (target: object, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.redirect = redirect
  }
}
