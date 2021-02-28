import { CallAdapter, CallAdapterFactory } from '../../../call.adapter'
import { RequestFactory } from '../../../request.factory'
import { Drizzle } from '../../../drizzle'
import { Call } from '../../../call'
import { DrizzleMeta } from '../../../drizzle.meta'

const KEY_IS_CALLBACK = 'callback:is_callback'

export function Callback() {
  return function (target: any, method: string) {
    const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor, method)
    requestFactory.addConfig(KEY_IS_CALLBACK, true)
  }
}

class CallbackCallAdapter implements CallAdapter<Promise<unknown>, void> {
  static INSTANCE: CallbackCallAdapter = new CallbackCallAdapter()

  adapt(action: Call<Promise<unknown>>): void {
    action.execute()
      .then(response => action.argv[action.argv.length - 1](null, response))
      .catch(error => action.argv[action.argv.length - 1](error, null))
  }
}

export class CallbackCallAdapterFactory extends CallAdapterFactory {
  provideCallAdapter(_drizzle: Drizzle, _method: string, requestFactory: RequestFactory): CallAdapter<unknown, unknown> | null {
    if (requestFactory.getConfig(KEY_IS_CALLBACK)) {
      return CallbackCallAdapter.INSTANCE
    }

    return null
  }
}
