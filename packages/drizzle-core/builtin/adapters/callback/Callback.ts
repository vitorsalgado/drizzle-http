import { createMethodDecorator } from '../../../ApiParameterization.js'

export const Callback = () =>
  createMethodDecorator(Callback, ctx => {
    ctx.requestFactory.argLen = Math.max(ctx.requestFactory.argLen, 1)
  })
