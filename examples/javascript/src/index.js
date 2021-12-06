'use strict'

const { DrizzleBuilder, GET, Query, ContentType, Accept, MediaTypes } = require('@drizzle-http/core')
const { UndiciCallFactory } = require('@drizzle-http/undici')

class PartiesClientAPI {
  @GET('/partidos')
  @ContentType(MediaTypes.APPLICATION_JSON_UTF8)
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
