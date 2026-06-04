import { Accept, ContentType, GET, MediaTypes, Query, Params as ApiParams } from '@drizzle-http/core'
import { noop } from '@drizzle-http/core'

export interface Party {
  id: string
  nome: string
}

export class PartiesAPI {
  @GET('/partidos')
  @ContentType(MediaTypes.APPLICATION_JSON)
  @Accept(MediaTypes.APPLICATION_JSON)
  @ApiParams([Query('sigla')])
  parties(acronym: string): Promise<{ dados: Party[] }> {
    return noop(acronym)
  }
}
