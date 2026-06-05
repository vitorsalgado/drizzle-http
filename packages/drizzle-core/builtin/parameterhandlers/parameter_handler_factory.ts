import { Drizzle } from '../../drizzle.js'
import { RequestFactory } from '../../request_factory.js'
import { Parameter } from './parameter.js'
import { ParameterHandler } from './parameter_handler.js'

export interface ParameterHandlerFactory<P extends Parameter, R> {
  provide(drizzle: Drizzle, requestFactory: RequestFactory, parameter: P): ParameterHandler<R> | null
}
