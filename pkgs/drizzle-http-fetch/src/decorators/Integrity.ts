import { provideRequestInit } from '../provideRequestInit'

export function Integrity(integrity: string) {
  return function (target: object, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.integrity = integrity
  }
}
