import { RequestFactory } from '../../../RequestFactory.ts'
import { Drizzle } from '../../../Drizzle.ts'
import { CallAdapter } from '../../../CallAdapter.ts'
import { CallAdapterFactory } from '../../../CallAdapter.ts'
import { CallbackCallAdapter } from './CallbackCallAdapter.ts'
import { Callback } from './Callback.ts'

export class CallbackCallAdapterFactory implements CallAdapterFactory {
  provide(drizzle: Drizzle, requestFactory: RequestFactory): CallAdapter<unknown, unknown> | null {
    if (requestFactory.hasDecorator(Callback)) {
      return CallbackCallAdapter.INSTANCE
    }

    return null
  }
}
