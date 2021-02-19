import { ContentType, DrizzleBuilder, GET, Response, theTypes } from '@drizzle-http/core'
import { CORS, FetchCallFactory, KeepAlive } from '../'

class ApiJs {
  @GET('/')
  @ContentType('application/json;charset=utf-8')
  @CORS()
  @KeepAlive(true)
  test() {
    return theTypes(Promise, Response)
  }
}

DrizzleBuilder.newBuilder()
  .baseUrl('http://localhost:3001/')
  .callFactory(FetchCallFactory.DEFAULT)
  .build()
  .create(ApiJs)
  .test()
  .then(response => {
    return response.text()
  })
  .then(txt => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    document.getElementById('test').innerText = txt
  })
