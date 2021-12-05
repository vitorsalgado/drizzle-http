import { DrizzleMeta } from '../drizzle.meta'
import { MediaTypes } from '../http.media.types'
import CommonHeaders from '../http.common.headers'

/**
 * Mark that the request body will use form url-encoding.
 * Form fields should be declared mark method parameters with \@Field decorator.
 * Target: method
 *
 * @example
 *  \@POST('/relative/path')
 *  \@FormUrlEncoded
 *  example(\@Field('name') name: string, \@Field('id') id: string): Promise<Result>
 */
export function FormUrlEncoded() {
  return function <TFunction extends Function>(target: object | TFunction, method?: string): void {
    if (method) {
      const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor.name, method)
      requestFactory.addDefaultHeader(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_FORM_URL_ENCODED_UTF8)
      return
    }

    DrizzleMeta.provideInstanceMetadata((target as TFunction).name).defaultHeaders.append(
      CommonHeaders.CONTENT_TYPE,
      MediaTypes.APPLICATION_FORM_URL_ENCODED_UTF8
    )
  }
}
