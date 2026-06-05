import { createMethodDecorator } from '../../api_parameterization.js'

export const NoRetry = () => createMethodDecorator(NoRetry)
