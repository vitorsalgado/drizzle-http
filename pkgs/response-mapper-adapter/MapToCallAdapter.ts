import { CallAdapter } from '@drizzle-http/core'
import { HttpRequest } from '@drizzle-http/core'
import { Call } from '@drizzle-http/core'

export class MapToCallAdapter<F, T> implements CallAdapter<F, Promise<T>> {
  constructor(private readonly Type: new (...args: any[]) => T, private readonly mapper?: Function) {}

  adapt(call: Call<F>): (request: HttpRequest, argv: unknown[]) => Promise<T> {
    return (request, argv) =>
      call.execute(request, argv).then(response => {
        if (this.mapper) {
          return this.mapper(response)
        } else {
          return new this.Type(response)
        }
      })
  }
}
