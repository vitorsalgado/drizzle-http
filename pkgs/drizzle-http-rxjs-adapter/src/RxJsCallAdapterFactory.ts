import { CallAdapter } from '@drizzle-http/core'
import { RequestFactory } from '@drizzle-http/core'
import { Drizzle } from '@drizzle-http/core'
import { CallAdapterFactory } from '@drizzle-http/core'
import { Call } from '@drizzle-http/core'
import { Observable } from 'rxjs'
import { from } from 'rxjs'
import { Keys } from './Keys'

class RxJsCallAdapter<T> implements CallAdapter<Promise<T>, Observable<T>> {
  constructor(private readonly decorated?: CallAdapter<unknown, Promise<T>>) {}

  adapt(action: Call<Promise<T>>): Observable<T> {
    if (this.decorated) {
      return from(this.decorated.adapt(action))
    }

    return from(action.execute())
  }
}

export class RxJsCallAdapterFactory implements CallAdapterFactory {
  static INSTANCE: RxJsCallAdapterFactory = new RxJsCallAdapterFactory()

  constructor(private readonly decorated?: CallAdapterFactory) {}

  provideCallAdapter(
    drizzle: Drizzle,
    method: string,
    requestFactory: RequestFactory
  ): CallAdapter<unknown, unknown> | null {
    if (requestFactory.returnIdentifier === Keys.RxJxKey) {
      if (this.decorated) {
        const adapter = this.decorated.provideCallAdapter(drizzle, method, requestFactory)

        if (adapter) {
          if (requestFactory.returnIdentifier === Keys.RxJxKey) {
            return new RxJsCallAdapter(adapter as CallAdapter<unknown, Promise<unknown>>)
          }
        }
      }

      return new RxJsCallAdapter()
    }

    return null
  }
}
