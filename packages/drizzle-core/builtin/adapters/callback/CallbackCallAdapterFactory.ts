import { RequestFactory } from '../../../RequestFactory.js'
import { Drizzle } from '../../../Drizzle.js'
import { CallAdapter } from '../../../CallAdapter.js'
import { CallAdapterFactory } from '../../../CallAdapter.js'
import { CallbackCallAdapter } from './CallbackCallAdapter.js'
import { Callback } from './Callback.js'

export class CallbackCallAdapterFactory implements CallAdapterFactory {
  provide(drizzle: Drizzle, requestFactory: RequestFactory): CallAdapter<unknown, unknown> | null {
    if (requestFactory.hasDecorator(Callback)) {
      return CallbackCallAdapter.INSTANCE
    }

    return null
  }
}
