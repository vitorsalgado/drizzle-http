import { CallAdapter } from '@drizzle-http/core'
import { HttpRequest } from '@drizzle-http/core'
import { Call } from '@drizzle-http/core'

export class MapCallAdapter<R, TR> implements CallAdapter<R, Promise<TR>> {
  constructor(private readonly mapper: (response: R) => TR) {}

  adapt(call: Call<R>): (request: HttpRequest, argv: unknown[]) => Promise<TR> {
    return (request, argv) => call.execute(request, argv).then(response => this.mapper(response))
  }
}
