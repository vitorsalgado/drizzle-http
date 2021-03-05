import { provideRequestInit } from '../meta'

export function Compress(compress = true) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.compress = compress
  }
}
