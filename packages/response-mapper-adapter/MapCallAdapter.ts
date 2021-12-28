import { CallAdapter } from '@drizzle-http/core'
import { HttpRequest } from '@drizzle-http/core'
import { Call } from '@drizzle-http/core'

export class MapCallAdapter<FROM, TO> implements CallAdapter<FROM, Promise<TO>> {
  constructor(private readonly mapper: (response: FROM) => TO) {}

  adapt(call: Call<FROM>): (request: HttpRequest, argv: unknown[]) => Promise<TO> {
    return (request, argv) => call.execute(request, argv).then(response => this.mapper(response))
  }
}
