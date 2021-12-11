import { setupRequestInit } from '../setupRequestInit'

export function Credentials(credentials: RequestCredentials) {
  return function (target: object, method: string): void {
    setupRequestInit(target, method, requestInit => (requestInit.credentials = credentials))
  }
}
