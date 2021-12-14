import { ContentType, DrizzleBuilder, GET } from '@drizzle-http/core'
import { noop } from '@drizzle-http/core'
import { MediaTypes } from '@drizzle-http/core'
import { FullResponse } from '@drizzle-http/core'
import { POST } from '@drizzle-http/core'
import { Body } from '@drizzle-http/core'
import { CORS } from '../decorators'
import { Mode } from '../decorators'
import { ReferrerPolicy } from '../decorators'
import { Referrer } from '../decorators'
import { Redirect } from '../decorators'
import { Cache } from '../decorators'
import { Navigate } from '../decorators'
import { KeepAlive } from '../decorators'
import { FetchCallFactory } from '../FetchCallFactory'

class ApiTs {
  @GET('/txt')
  @ContentType(MediaTypes.TEXT_PLAIN)
  @CORS()
  @KeepAlive(true)
  @FullResponse()
  txt(): Promise<Response> {
    return noop()
  }

  @POST('/json')
  @ContentType(MediaTypes.APPLICATION_JSON)
  @Mode('cors')
  @ReferrerPolicy('no-referrer')
  @Referrer('ref')
  @Redirect('manual')
  @Cache('no-cache')
  @Navigate()
  json(@Body() data: unknown): Promise<{ status: string; data: { test: string } }> {
    return noop(data)
  }
}

const tsApi = DrizzleBuilder.newBuilder()
  .baseUrl('http://localhost:3001/')
  .callFactory(FetchCallFactory.DEFAULT)
  .build()
  .create(ApiTs)

document.addEventListener('DOMContentLoaded', () => {
  tsApi
    .txt()
    .then(response => response.text())
    .then(txt => {
      ;(document.getElementById('txt') as HTMLDivElement).textContent = txt
    })

  tsApi.json({ test: 'json' }).then(response => {
    ;(document.getElementById('json') as HTMLDivElement).textContent = JSON.stringify(response)
  })
})
