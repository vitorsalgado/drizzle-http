import { Call, CallAdapter, CallAdapterFactory, Drizzle, DrizzleMeta, RequestFactory } from '@drizzle-http/core'
import { from, Observable } from 'rxjs'

export function RxJs() {
  return function (target: any, method: string): void {
    const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor, method)
    requestFactory.returnType = Observable
  }
}

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
    if (requestFactory.returnType && requestFactory.returnType.name === 'Observable') {
      return RxJsCallAdapter.INSTANCE
    }

    return null
  }
}
