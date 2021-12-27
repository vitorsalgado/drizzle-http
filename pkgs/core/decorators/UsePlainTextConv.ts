import { BuiltInConv } from '../builtin'
import { createRequestAndResponseTypes } from './utils'

export const UsePlainTextConv = (request = true, response = true) =>
  createRequestAndResponseTypes(BuiltInConv.TEXT, UsePlainTextConv, request, response)
