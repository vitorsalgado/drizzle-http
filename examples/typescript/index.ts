import { Accept, ContentType, DrizzleBuilder, GET, MediaTypes, Query } from '@drizzle-http/core'
import { noop } from '@drizzle-http/core'
import { UndiciCallFactory } from '@drizzle-http/undici'
import { LoggingInterceptor } from '@drizzle-http/logging-interceptor'
import { Level } from '@drizzle-http/logging-interceptor'

interface Party {
  id: string
  nome: string
}

class PartiesAPI {
  @GET('/partidos')
  @ContentType(MediaTypes.APPLICATION_JSON)
  @Accept(MediaTypes.APPLICATION_JSON)
  parties(@Query('sigla') acronym: string): Promise<{ dados: Party[] }> {
    return noop(acronym)
  }
}

const partiesApi = DrizzleBuilder.newBuilder()
  .baseUrl('https://dadosabertos.camara.leg.br/api/v2/')
  .callFactory(new UndiciCallFactory())
  .addInterceptor(new LoggingInterceptor({ level: Level.BODY }))
  .build()
  .create(PartiesAPI)

async function run() {
  const parties = await partiesApi.parties('pt')
  console.log(parties)
}

;(async () => await run())()
