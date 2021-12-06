import { ContentType, DrizzleBuilder, GET } from '@drizzle-http/core'
import { noop } from '@drizzle-http/core'
import { MediaTypes } from '@drizzle-http/core'
import { FullResponse } from '@drizzle-http/core'
import { CORS, FetchCallFactory } from '../..'
import { KeepAlive } from '../../decorators'

class ApiTs {
  @GET('/')
  @ContentType(MediaTypes.APPLICATION_JSON_UTF8)
  @CORS()
  @KeepAlive(true)
  @FullResponse()
  test(): Promise<Response> {
    return noop()
  }
}

DrizzleBuilder.newBuilder()
  .baseUrl('http://localhost:3001/')
  .callFactory(FetchCallFactory.DEFAULT)
  .build()
  .create(ApiTs)
  .test()
  .then(response => response.text())
  .then(txt => {
    ;(document.getElementById('test') as HTMLDivElement).textContent = txt
  })
