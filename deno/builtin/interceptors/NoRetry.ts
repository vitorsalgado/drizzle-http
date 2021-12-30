import { createMethodDecorator } from '../../ApiParameterization.ts'

export const NoRetry = () => createMethodDecorator(NoRetry)
