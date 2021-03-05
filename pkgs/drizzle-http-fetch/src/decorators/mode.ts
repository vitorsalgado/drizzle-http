import { provideRequestInit } from '../meta'

export function Mode(mode: RequestMode) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.mode = mode
  }
}

export function CORS() {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.mode = 'cors'
  }
}

export function SameOrigin() {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.mode = 'same-origin'
  }
}

export function NoCORS() {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.mode = 'no-cors'
  }
}

export function Navigate() {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.mode = 'navigate'
  }
}
