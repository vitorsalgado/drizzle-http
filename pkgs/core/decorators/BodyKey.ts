import { createParameterDecorator } from '../ApiParameterization'

export const BodyKey = (name: string) =>
  createParameterDecorator(BodyKey, ctx => ctx.requestFactory.addConfig(BodyKey.KEY, name))

BodyKey.KEY = 'bodykey'
