import { provideRequestInit } from '../meta'

export function Size(size = 0) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.size = size
  }
}
