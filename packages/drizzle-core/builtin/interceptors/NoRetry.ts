import { createMethodDecorator } from '../../ApiParameterization.js'

export const NoRetry = () => createMethodDecorator(NoRetry)
