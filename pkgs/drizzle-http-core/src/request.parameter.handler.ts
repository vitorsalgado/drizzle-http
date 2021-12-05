import { Drizzle } from './drizzle'
import { RequestFactory } from './request.factory'
import { RequestParameterization } from './request.parameterization'

export class Parameter {
  constructor(public readonly index: number, public readonly type: string) {}
}

export abstract class ParameterHandler<P extends Parameter, V> {
  constructor(public readonly parameter: P) {}

  abstract apply(requestValues: RequestParameterization, value: V): void
}

export abstract class ParameterHandlerFactory<P extends Parameter, R> {
  abstract handledType(): string

  abstract parameterHandler(drizzle: Drizzle, requestFactory: RequestFactory, parameter: P): ParameterHandler<P, R>
}
