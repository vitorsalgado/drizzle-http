import { provideRequestInit } from './meta'

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

export function Cache(cache: RequestCache) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.cache = cache
  }
}

export function Credentials(credentials: RequestCredentials) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.credentials = credentials
  }
}

export function Redirect(redirect: RequestRedirect) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.redirect = redirect
  }
}

export function Referrer(referrer: string) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.referrer = referrer
  }
}

export function ReferrerPolicy(referrerPolicy: ReferrerPolicy) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.referrerPolicy = referrerPolicy
  }
}

export function KeepAlive(keepAlive: boolean) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.keepalive = keepAlive
  }
}

export function Integrity(integrity: string) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.integrity = integrity
  }
}
