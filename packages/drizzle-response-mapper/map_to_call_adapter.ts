import { Call, CallAdapter, HttpRequest, Internals } from '@drizzle-http/core'

export class MapToCallAdapter<F, T> implements CallAdapter<F, Promise<T>> {
  constructor(
    private readonly Type: Internals.Class,
    private readonly mapper?: (from: F) => T,
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
            return new this.Type(response) as T
          }
        })
    }

    return (request, argv) =>
      call.execute(request, argv).then(response => {
        if (this.mapper) {
          return this.mapper(response)
        } else {
          return new this.Type(response) as T
        }
      })
  }
}
