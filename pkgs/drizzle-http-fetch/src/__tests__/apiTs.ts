import { ContentType, DrizzleBuilder, GET } from '@drizzle-http/core'
import { noop } from '@drizzle-http/core'
import { MediaTypes } from '@drizzle-http/core'
import { FullResponse } from '@drizzle-http/core'
import { POST } from '@drizzle-http/core'
import { Body } from '@drizzle-http/core'
import { TestResult } from '@drizzle-http/test-utils'
import { CORS } from '../decorators'
import { Mode } from '../decorators'
import { NoCORS } from '../decorators'
import { SameOrigin } from '../decorators'
import { Integrity } from '../decorators'
import { ReferrerPolicy } from '../decorators'
import { Referrer } from '../decorators'
import { Redirect } from '../decorators'
import { Credentials } from '../decorators'
import { Cache } from '../decorators'
import { Navigate } from '../decorators'
import { KeepAlive } from '../decorators'
import { FetchCallFactory } from '../FetchCallFactory'

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
