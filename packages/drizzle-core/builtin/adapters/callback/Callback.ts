import { createMethodDecorator } from '../../../api_parameterization.js'

export const Callback = () =>
  createMethodDecorator(Callback, ctx => {
    ctx.requestFactory.argLen = Math.max(ctx.requestFactory.argLen, 1)
  })
