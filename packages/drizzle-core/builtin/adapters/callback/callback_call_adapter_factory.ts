import { RequestFactory } from '../../../request_factory.js'
import { Drizzle } from '../../../drizzle.js'
import { CallAdapter } from '../../../call_adapter.js'
import { CallAdapterFactory } from '../../../call_adapter.js'
import { CallbackCallAdapter } from './callback_call_adapter.js'
import { Callback } from './callback.js'

export class CallbackCallAdapterFactory implements CallAdapterFactory {
  provide(drizzle: Drizzle, requestFactory: RequestFactory): CallAdapter<unknown, unknown> | null {
    if (requestFactory.hasDecorator(Callback)) {
      return CallbackCallAdapter.INSTANCE
    }

    return null
  }
}
