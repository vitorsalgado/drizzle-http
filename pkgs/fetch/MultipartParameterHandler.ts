import { ParameterHandler } from '@drizzle-http/core'
import { ParameterHandlerFactory } from '@drizzle-http/core'
import { Drizzle } from '@drizzle-http/core'
import { RequestFactory } from '@drizzle-http/core'
import { PartParameter } from '@drizzle-http/core'
import { RequestParameterization } from '@drizzle-http/core'

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
