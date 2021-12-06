import { ContentType, DrizzleBuilder, FullResponse, GET, MediaTypes, noop } from '@drizzle-http/core'
import { CORS, FetchCallFactory, KeepAlive } from '../..'

class ApiJs {
  @GET('/')
  @ContentType(MediaTypes.APPLICATION_JSON_UTF8)
  @CORS()
  @KeepAlive(true)
  @FullResponse()
  test() {
    return noop()
  }
}

DrizzleBuilder.newBuilder()
  .baseUrl('http://localhost:3001/')
  .callFactory(FetchCallFactory.DEFAULT)
  .build()
  .create(ApiJs)
  .test()
  .then(response => response.text())
  .then(txt => {
    document.getElementById('test').textContent = txt
  })
