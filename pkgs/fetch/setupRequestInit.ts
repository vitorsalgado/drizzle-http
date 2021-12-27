import { Metadata } from '@drizzle-http/core'
import { Keys } from './Keys'

/**
 * Get or create a RequestInit instance associated with an API class and method
 */
export function setupRequestInit(
  target: object | Function,
  method: string,
  callback: (requestInit: RequestInit) => void
): void {
  const requestFactory = Metadata.requestFactory(target, method)
  let requestInit = requestFactory.getConfig(Keys.RequestInitMethod) as RequestInit

  if (requestInit) {
    return callback(requestInit)
  }

  requestInit = {}

  requestFactory.addConfig(Keys.RequestInitMethod, requestInit)

  return callback(requestInit)
}

export function createFetchDecorator(decorator: Function, callback: (requestInit: RequestInit) => void) {
  return function (target: object | Function, method?: string) {
    if (method) {
      const requestFactory = Metadata.requestFactory(target, method)
      requestFactory.registerDecorator(decorator)

      let requestInit = requestFactory.getConfig(Keys.RequestInitMethod) as RequestInit

      if (requestInit) {
        return callback(requestInit)
      }

      requestInit = {}

      requestFactory.addConfig(Keys.RequestInitMethod, requestInit)

      return callback(requestInit)
    }

    const defaults = Metadata.apiDefaults(target)
    defaults.decorators.push(decorator)

    let requestInit = defaults.getConfig(Keys.RequestInitDefaults) as RequestInit

    if (requestInit) {
      return callback(requestInit)
    }

    requestInit = {}

    defaults.addConfig(Keys.RequestInitDefaults, requestInit)

    return callback(requestInit)
  }
}
