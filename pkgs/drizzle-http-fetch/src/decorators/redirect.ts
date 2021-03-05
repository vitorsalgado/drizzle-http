import { provideRequestInit } from '../meta'

export function Redirect(redirect: RequestRedirect) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.redirect = redirect
  }
}
