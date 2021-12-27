// @ts-nocheck

import { ContentType } from '@drizzle-http/core'
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
  post(
    @Param('id') _id: string,
    @Query('filter') _filter: string,
    @Body() _data: unknown
  ): Promise<{ id: string; name: string; context: string }[]> {}

  @POST('/{id}')
  @CircuitBreaker()
  postCb(
    @Param('id') _id: string,
    @Query('filter') _filter: string,
    @Body() _data: unknown
  ): Promise<{ id: string; name: string; context: string }[]> {}

  @GET('/')
  @Streaming()
  streaming(@StreamTo() target: Writable): Promise<HttpResponse> {}
}
