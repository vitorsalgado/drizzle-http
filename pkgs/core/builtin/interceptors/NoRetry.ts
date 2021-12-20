import { createMethodDecorator } from '../../ApiParameterization'

export const NoRetry = () => createMethodDecorator(NoRetry)
