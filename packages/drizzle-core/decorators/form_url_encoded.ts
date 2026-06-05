import { createClassAndMethodDecorator } from '../api_parameterization.js'
import { MediaTypes } from '../media_types.js'
import { CommonHeaders } from '../headers.js'
import { BuiltInConv } from '../index.js'

/**
 * Mark that the request body will use form url-encoding.
 * Form fields should be declared via \@Params([Field(...)]).
 * Target: class, method
 */
export function FormUrlEncoded() {
  return createClassAndMethodDecorator(FormUrlEncoded, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.addDefaultHeader(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_FORM_URL_ENCODED)
      ctx.requestFactory!.requestType = BuiltInConv.FORM_URL_ENCODED
    } else {
      ctx.defaults.headers.append(CommonHeaders.CONTENT_TYPE, MediaTypes.APPLICATION_FORM_URL_ENCODED)
      ctx.defaults.requestType = BuiltInConv.FORM_URL_ENCODED
    }
  })
}
