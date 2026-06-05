import {
  Body,
  ContentType,
  GET,
  HttpResponse,
  MediaTypes,
  noop,
  Param,
  Params,
  POST,
  Query,
  RawResponse
} from '@drizzle-http/core'
import { CircuitBreaker } from '@drizzle-http/opossum-circuit-breaker'
import { StreamTo, Streaming } from '@drizzle-http/undici'
import type { Writable } from 'stream'

type BenchResponse = { id: string; name: string; context: string }[]

@ContentType(MediaTypes.APPLICATION_JSON)
export class TestAPI {
  @GET('/')
  @RawResponse()
  getArgLess(): Promise<HttpResponse> {
    return noop()
  }

  @POST('/{id}')
  @Params([Param('id'), Query('filter'), Body()])
  post(_id: string, _filter: string, _data: unknown): Promise<BenchResponse> {
    return noop(_id, _filter, _data)
  }

  @POST('/{id}')
  @CircuitBreaker()
  @Params([Param('id'), Query('filter'), Body()])
  postCb(_id: string, _filter: string, _data: unknown): Promise<BenchResponse> {
    return noop(_id, _filter, _data)
  }

  @GET('/')
  @Streaming()
  @Params([StreamTo()])
  streaming(_target: Writable): Promise<HttpResponse> {
    return noop(_target)
  }
}
