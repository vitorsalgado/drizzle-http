import { Accept, ContentType, DrizzleBuilder, GET, MediaTypes, Query } from '@drizzle-http/core'
import { noop } from '@drizzle-http/core'
import { UndiciCallFactory } from '@drizzle-http/undici'

interface Party {
  id: string
  nome: string
}

class PartiesAPI {
  @GET('/partidos')
  @ContentType(MediaTypes.APPLICATION_JSON)
  @Accept(MediaTypes.APPLICATION_JSON)
  parties(@Query('sigla') acronym: string): Promise<Party[]> {
    return noop(acronym)
  }
}

const partiesApi = DrizzleBuilder.newBuilder()
  .baseUrl('https://dadosabertos.camara.leg.br/api/v2/')
  .callFactory(new UndiciCallFactory())
  .build()
  .create(PartiesAPI)

async function run() {
  const parties = await partiesApi.parties('pt')
  console.log(parties)
}

;(async () => await run())()
