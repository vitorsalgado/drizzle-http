import { CallAdapter } from '@drizzle-http/core'
import { HttpRequest } from '@drizzle-http/core'
import { Call } from '@drizzle-http/core'
import { Internals } from '@drizzle-http/core'

export class MapToCallAdapter<F, T> implements CallAdapter<F, Promise<T>> {
  constructor(
    private readonly Type: Internals.Class,
    private readonly mapper?: Function,
    private readonly decorated?: CallAdapter<unknown, Promise<F>> | null
  ) {}

  adapt(call: Call<F>): (request: HttpRequest, argv: unknown[]) => Promise<T> {
    if (this.decorated) {
      const fn = this.decorated.adapt(call)
      return (request, argv) =>
        fn(request, argv).then(response => {
          if (this.mapper) {
            return this.mapper(response)
          } else {
            return new this.Type(response)
          }
        })
    }

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
