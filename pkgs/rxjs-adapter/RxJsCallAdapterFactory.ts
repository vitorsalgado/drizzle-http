import { CallAdapter } from '@drizzle-http/core'
import { RequestFactory } from '@drizzle-http/core'
import { Drizzle } from '@drizzle-http/core'
import { CallAdapterFactory } from '@drizzle-http/core'
import { Call } from '@drizzle-http/core'
import { HttpRequest } from '@drizzle-http/core'
import { Observable } from 'rxjs'
import { from } from 'rxjs'
import { RxJs } from './RxJs'

class RxJsCallAdapter<T> implements CallAdapter<T, Observable<T>> {
  constructor(private readonly decorated: CallAdapter<unknown, Promise<T>> | null = null) {}

  adapt(call: Call<T>): (request: HttpRequest, argv: unknown[]) => Observable<T> {
    if (this.decorated) {
      const adapted = this.decorated.adapt(call)

      return (request, argv) => from(adapted(request, argv))
    }

    return (request, argv) => from(call.execute(request, argv))
  }
}

export class RxJsCallAdapterFactory implements CallAdapterFactory {
  static INSTANCE: RxJsCallAdapterFactory = new RxJsCallAdapterFactory()

  constructor(private readonly decorated?: CallAdapterFactory) {}

  provide(drizzle: Drizzle, method: string, requestFactory: RequestFactory): CallAdapter<unknown, unknown> | null {
    if (requestFactory.hasDecorator(RxJs)) {
      if (this.decorated) {
        const adapter = this.decorated.provide(drizzle, method, requestFactory)

        if (adapter) {
          if (requestFactory.hasDecorator(RxJs)) {
            return new RxJsCallAdapter(adapter as CallAdapter<unknown, Promise<unknown>>)
          }
        }
      }

      return new RxJsCallAdapter()
    }

    return null
  }
}
