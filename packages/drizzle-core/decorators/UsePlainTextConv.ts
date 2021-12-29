import { BuiltInConv } from '../builtin'
import { createRequestAndResponseTypes } from './utils'

/**
 * Define a text/plain Content-Type for both request and response
 *
 * @param request - sets the content-type of the request. defaults to true
 * @param response - sets the content-type of the response. defaults to true.
 */
export const UsePlainTextConv = (request = true, response = true) =>
  createRequestAndResponseTypes(BuiltInConv.TEXT, UsePlainTextConv, request, response)
