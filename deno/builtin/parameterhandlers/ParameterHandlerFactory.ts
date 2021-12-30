import { Drizzle } from '../../Drizzle.ts'
import { RequestFactory } from '../../RequestFactory.ts'
import { Parameter } from './Parameter.ts'
import { ParameterHandler } from './ParameterHandler.ts'

export interface ParameterHandlerFactory<P extends Parameter, R> {
  provide(drizzle: Drizzle, requestFactory: RequestFactory, parameter: P): ParameterHandler<R> | null
}
