import { provideRequestInit } from '../meta'

export function Integrity(integrity: string) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.integrity = integrity
  }
}
