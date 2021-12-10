'use strict'

import { Accept, ContentType, DrizzleBuilder, GET, MediaTypes, Query } from '@drizzle-http/core'
import { UndiciCallFactory } from '@drizzle-http/undici'

class PartiesClientAPI {
  @GET('/partidos')
  @ContentType(MediaTypes.APPLICATION_JSON)
  @Accept(MediaTypes.APPLICATION_JSON)
  parties(@Query('sigla') acronym) {}
}

const deputiesApi = DrizzleBuilder.newBuilder()
  .baseUrl(`https://dadosabertos.camara.leg.br/api/v2/`)
  .callFactory(new UndiciCallFactory())
  .build()
  .create(PartiesClientAPI)

async function run() {
  const parties = await deputiesApi.parties('pt')

  console.log(parties)
}

;(async () => await run())()
