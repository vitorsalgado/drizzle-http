import { provideRequestInit } from '../meta'

export function Credentials(credentials: RequestCredentials) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.credentials = credentials
  }
}
