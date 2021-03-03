import { ContentType, DrizzleBuilder, GET, MediaTypes, POST, Response, theTypes } from '@drizzle-http/core'
import {
  Cache,
  CORS,
  Credentials,
  FetchCallFactory,
  Integrity,
  KeepAlive,
  Mode,
  Navigate,
  NoCORS,
  Redirect,
  Referrer,
  ReferrerPolicy,
  SameOrigin
} from '../'

class ApiTs {
  @GET('/')
  @ContentType('application/json;charset=utf-8')
  @CORS()
  @KeepAlive(true)
  test(): Promise<Response> {
    return theTypes(Promise, Response)
  }
}

DrizzleBuilder.newBuilder()
  .baseUrl('http://localhost:3001/')
  .callFactory(FetchCallFactory.DEFAULT)
  .build()
  .create(ApiTs)
  .test()
  .then((response: Response) => {
    return response.text()
  })
  .then((txt: any) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    document.getElementById('test').innerText = txt
  })
