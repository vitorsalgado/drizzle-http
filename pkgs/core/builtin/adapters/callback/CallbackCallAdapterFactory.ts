import { RequestFactory } from '../../../RequestFactory'
import { Drizzle } from '../../../Drizzle'
import { CallAdapter } from '../../../CallAdapter'
import { CallAdapterFactory } from '../../../CallAdapter'
import { CallbackCallAdapter } from './CallbackCallAdapter'
import { Callback } from './Callback'

export class CallbackCallAdapterFactory implements CallAdapterFactory {
  provide(drizzle: Drizzle, requestFactory: RequestFactory): CallAdapter<unknown, unknown> | null {
    if (requestFactory.hasDecorator(Callback)) {
      return CallbackCallAdapter.INSTANCE
    }

    return null
  }
}
