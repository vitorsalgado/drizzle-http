import { provideRequestInit } from '../provideRequestInit'

export function Navigate() {
  return function (target: object, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.mode = 'navigate'
  }
}
