import { provideRequestInit } from '../provideRequestInit'

export function Credentials(credentials: RequestCredentials) {
  return function (target: object, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.credentials = credentials
  }
}
