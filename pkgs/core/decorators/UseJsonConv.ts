import { BuiltInConv } from '../builtin'
import { createRequestAndResponseTypes } from './utils'

export const UseJsonConv = (request = true, response = true) =>
  createRequestAndResponseTypes(BuiltInConv.JSON, UseJsonConv, request, response)
