import { ContentType } from '@drizzle-http/core'
import { MediaTypes } from '@drizzle-http/core'
import { GET } from '@drizzle-http/core'
import { FullResponse } from '@drizzle-http/core'
import { noop } from '@drizzle-http/core'
import { POST } from '@drizzle-http/core'
import { Param } from '@drizzle-http/core'
import { Query } from '@drizzle-http/core'
import { Body } from '@drizzle-http/core'
import { HttpResponse } from '@drizzle-http/core'
import { Streaming } from '@drizzle-http/undici'
import { StreamTo } from '@drizzle-http/undici'
import { Writable } from 'stream'
import { CircuitBreaker } from '@drizzle-http/opossum-circuit-breaker'

@ContentType(MediaTypes.APPLICATION_JSON)
export class TestAPI {
  @GET('/')
  @FullResponse()
  getArgLess(): Promise<Response> {
    return noop()
  }

  @POST('/{id}')
  post(
    @Param('id') _id: string,
    @Query('filter') _filter: string,
    @Body() _data: unknown
  ): Promise<{ id: string; name: string; context: string }[]> {
    return noop(_id, _filter, _data)
  }

  @POST('/{id}')
  @CircuitBreaker()
  postCb(
    @Param('id') _id: string,
    @Query('filter') _filter: string,
    @Body() _data: unknown
  ): Promise<{ id: string; name: string; context: string }[]> {
    return noop(_id, _filter, _data)
  }

  @GET('/')
  @Streaming()
  streaming(@StreamTo() target: Writable): Promise<HttpResponse> {
    return noop(target)
  }
}
