import { provideRequestInit } from '../meta'

export function Follow(count = 0) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.follow = count
  }
}
