import { ParameterHandler } from '../builtin/index.ts'
import { ParameterHandlerFactory } from '../builtin/index.ts'
import { PartParameter } from '../builtin/index.ts'
import { Drizzle } from '../Drizzle.ts'
import { RequestFactory } from '../RequestFactory.ts'
import { RequestParameterization } from '../RequestParameterization.ts'

export class MultipartParameterHandler implements ParameterHandler<Blob> {
  constructor(private readonly name: string, private readonly filename?: string) {}

  handle(requestValues: RequestParameterization, value: Blob): void {
    requestValues.body = requestValues.body || new FormData()

    if (this.filename) {
      ;(requestValues.body as FormData).append(this.name, value, this.filename)
    } else {
      ;(requestValues.body as FormData).append(this.name, value)
    }
  }
}

export class PartParameterHandlerFactory implements ParameterHandlerFactory<PartParameter, Blob> {
  provide(drizzle: Drizzle, requestFactory: RequestFactory, parameter: PartParameter): ParameterHandler<Blob> | null {
    if (parameter.type === PartParameter.Type) {
      return new MultipartParameterHandler(parameter.name, parameter.filename)
    }

    return null
  }
}
