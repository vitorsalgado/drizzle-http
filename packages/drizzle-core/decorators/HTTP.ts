import { decorateWithHttpMethod } from './utils/index.js'

export const HTTP = (method: string, path = '') => decorateWithHttpMethod(HTTP, method, path)
