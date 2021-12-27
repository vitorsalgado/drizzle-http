import { TargetClass } from '../../internal'
import { createMethodDecorator } from '../../ApiParameterization'
import { createClassDecorator } from '../../ApiParameterization'

export const createRequestAndResponseTypes = (
  type: string,
  decorator: Function,
  request: boolean = true,
  response: boolean = true
) => {
  return function (target: object | TargetClass, method?: string, descriptor?: PropertyDescriptor) {
    if (method && descriptor) {
      return createMethodDecorator(decorator, ctx => {
        if (request) {
          ctx.requestFactory.requestType = type
        }

        if (response) {
          ctx.requestFactory.responseType = type
        }
      })(target, method, descriptor)
    }

    createClassDecorator(decorator, ctx => {
      if (request) {
        ctx.defaults.requestType = type
      }

      if (response) {
        ctx.defaults.responseType = type
      }
    })(target as TargetClass)
  }
}
