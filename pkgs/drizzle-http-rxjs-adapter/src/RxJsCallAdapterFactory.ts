import { CallAdapter } from '@drizzle-http/core'
import { RequestFactory } from '@drizzle-http/core'
import { Drizzle } from '@drizzle-http/core'
import { CallAdapterFactory } from '@drizzle-http/core'
import { Call } from '@drizzle-http/core'
import { Observable } from 'rxjs'
import { from } from 'rxjs'
import { Keys } from './Keys'

class RxJsCallAdapter<T> implements CallAdapter<Promise<T>, Observable<T>> {
  static INSTANCE: RxJsCallAdapter<unknown> = new RxJsCallAdapter<unknown>()

  adapt(action: Call<Promise<T>>): Observable<T> {
    return from(action.execute())
  }
}

export class RxJsCallAdapterFactory extends CallAdapterFactory {
  static INSTANCE: RxJsCallAdapterFactory = new RxJsCallAdapterFactory()

  provideCallAdapter(
    drizzle: Drizzle,
    method: string,
    requestFactory: RequestFactory
  ): CallAdapter<unknown, unknown> | null {
    if (requestFactory.returnIdentifier === Keys.RxJxKey) {
      return RxJsCallAdapter.INSTANCE
    }

    return null
  }
}
