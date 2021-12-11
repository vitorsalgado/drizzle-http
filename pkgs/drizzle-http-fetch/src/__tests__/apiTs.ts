import { ContentType, DrizzleBuilder, GET } from '@drizzle-http/core'
import { noop } from '@drizzle-http/core'
import { MediaTypes } from '@drizzle-http/core'
import { FullResponse } from '@drizzle-http/core'
import { POST } from '@drizzle-http/core'
import { Body } from '@drizzle-http/core'
import { TestResult } from '@drizzle-http/test-utils'
import { CORS, FetchCallFactory } from '..'
import { Mode } from '..'
import { NoCORS } from '..'
import { SameOrigin } from '..'
import { Integrity } from '..'
import { ReferrerPolicy } from '..'
import { Referrer } from '..'
import { Redirect } from '..'
import { Credentials } from '..'
import { Cache } from '..'
import { Navigate } from '..'
import { KeepAlive } from '..'

class ApiTs {
  @GET('/')
  @ContentType(MediaTypes.APPLICATION_JSON)
  @CORS()
  @KeepAlive(true)
  @FullResponse()
  test(): Promise<Response> {
    return noop()
  }

  @POST('/')
  @ContentType(MediaTypes.APPLICATION_JSON)
  @Mode('cors')
  @NoCORS()
  @SameOrigin()
  @Integrity('hash')
  @ReferrerPolicy('same-origin')
  @Referrer('ref')
  @Redirect('manual')
  @Credentials('include')
  @Cache('force-cache')
  @Navigate()
  all(@Body() data: unknown): Promise<TestResult<unknown>> {
    return noop(data)
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
