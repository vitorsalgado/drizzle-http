//@ts-nocheck

import { RawResponse } from '../deno/index.ts'
import { ContentType, GET, Query } from '../deno/index.ts'
import { DrizzleBuilder } from '../deno/index.ts'
import { DenoFetchCallFactory } from '../deno/fetch/index.ts'
import { MediaTypes } from '../deno/index.ts'

class Api {
  @GET('/partidos')
  @ContentType(MediaTypes.TEXT_PLAIN)
  @RawResponse()
  parties(@Query('sigla') acronym: string): Promise<Response> {}
}

const api = DrizzleBuilder.newBuilder()
  .baseUrl('https://dadosabertos.camara.leg.br/api/v2/')
  .callFactory(new DenoFetchCallFactory())
  .build()
  .create(Api)

api
  .parties('pt')
  .then(response => response.json())
  .then(json => console.log(json))
