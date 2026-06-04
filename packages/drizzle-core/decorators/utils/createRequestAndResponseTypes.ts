import { Decorator } from '../../internal/index.js'
import { createClassAndMethodDecorator } from '../../ApiParameterization.js'

export const createRequestAndResponseTypes = (type: string, decorator: Decorator, request = true, response = true) =>
  createClassAndMethodDecorator(decorator, ctx => {
    if (ctx.kind === 'method') {
      if (request) {
        ctx.requestFactory!.requestType = type
      }

      if (response) {
        ctx.requestFactory!.responseType = type
      }
    } else {
      if (request) {
        ctx.defaults.requestType = type
      }

      if (response) {
        ctx.defaults.responseType = type
      }
    }
  })
