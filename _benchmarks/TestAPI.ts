// @ts-nocheck

import { ContentType, Params } from '@drizzle-http/core'
import { MediaTypes } from '@drizzle-http/core'
import { GET } from '@drizzle-http/core'
import { POST } from '@drizzle-http/core'
import { Param } from '@drizzle-http/core'
import { Query } from '@drizzle-http/core'
import { Body } from '@drizzle-http/core'
import { HttpResponse } from '@drizzle-http/core'
import { RawResponse } from '@drizzle-http/core'
import { Streaming } from '@drizzle-http/undici'
import { StreamTo } from '@drizzle-http/undici'
import { Writable } from 'stream'
import { CircuitBreaker } from '@drizzle-http/opossum-circuit-breaker'

@ContentType(MediaTypes.APPLICATION_JSON)
export class TestAPI {
  @GET('/')
  @RawResponse()
  async getArgLess(): Promise<HttpResponse> {}

  @POST('/{id}')
  @Params([Param('id'), Query('filter'), Body()])
  post(_id: string, _filter: string, _data: unknown): Promise<{ id: string; name: string; context: string }[]> {}

  @POST('/{id}')
  @CircuitBreaker()
  @Params([Param('id'), Query('filter'), Body()])
  postCb(_id: string, _filter: string, _data: unknown): Promise<{ id: string; name: string; context: string }[]> {}

  @GET('/')
  @Streaming()
  @Params([StreamTo()])
  streaming(target: Writable): Promise<HttpResponse> {}
}
