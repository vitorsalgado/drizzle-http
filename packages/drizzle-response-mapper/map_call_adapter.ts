import { CallAdapter } from '@drizzle-http/core'
import { HttpRequest } from '@drizzle-http/core'
import { Call } from '@drizzle-http/core'

export class MapCallAdapter<FROM, TO> implements CallAdapter<FROM, Promise<TO>> {
  constructor(
    private readonly mapper: (response: FROM) => TO,
    private readonly decorated: CallAdapter<unknown, Promise<FROM>> | null = null
  ) {}

  adapt(call: Call<FROM>): (request: HttpRequest, argv: unknown[]) => Promise<TO> {
    if (this.decorated) {
      const fn = this.decorated.adapt(call)
      return (request, argv) => fn(request, argv).then(response => this.mapper(response))
    }

    return (request, argv) => call.execute(request, argv).then(response => this.mapper(response))
  }
}
