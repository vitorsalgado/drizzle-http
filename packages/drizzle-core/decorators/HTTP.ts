import { decorateWithHttpMethod } from './utils'

export const HTTP = (method: string, path = '') => decorateWithHttpMethod(HTTP, method, path)
