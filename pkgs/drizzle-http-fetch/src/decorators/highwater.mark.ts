import { provideRequestInit } from '../meta'

export function HighWaterMark(highWaterMark: number) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    requestInit.highWaterMark = highWaterMark
  }
}
