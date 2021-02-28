import { Accept, ContentType, DrizzleBuilder, GET, MediaTypes, Query, theTypes } from '@drizzle-http/core'
import { UndiciCallFactory } from '@drizzle-http/undici'

interface Party {
  id: string
  nome: string
}

class PartiesAPI {
  @GET('/partidos')
  @ContentType(MediaTypes.APPLICATION_JSON_UTF8)
  @Accept(MediaTypes.APPLICATION_JSON)
  parties(@Query('sigla') acronym: string): Promise<Party[]> {
    return theTypes(Promise)
  }
}

const partiesApi: PartiesAPI = DrizzleBuilder.newBuilder()
  .baseUrl('https://dadosabertos.camara.leg.br/api/v2/')
  .callFactory(UndiciCallFactory.DEFAULT)
  .build()
  .create(PartiesAPI)

async function run() {
  const parties = await partiesApi.parties('pt')
  console.log(parties)
}

(async () => await run())()
