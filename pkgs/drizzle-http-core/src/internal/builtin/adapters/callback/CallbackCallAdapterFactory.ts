import { CallAdapter } from '../../../../call.adapter'
import { CallAdapterFactory } from '../../../../call.adapter'
import { RequestFactory } from '../../../../request.factory'
import { Drizzle } from '../../../../drizzle'
import { CallbackCallAdapter } from './CallbackCallAdapter'
import { KEY_IS_CALLBACK } from './Keys'

export class CallbackCallAdapterFactory extends CallAdapterFactory {
  provideCallAdapter(
    _drizzle: Drizzle,
    _method: string,
    requestFactory: RequestFactory
  ): CallAdapter<unknown, unknown> | null {
    if (requestFactory.hasConfig(KEY_IS_CALLBACK)) {
      return CallbackCallAdapter.INSTANCE
    }

    return null
  }
}
