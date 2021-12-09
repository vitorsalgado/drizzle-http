import { Accept, ContentType, GET, MediaTypes, Query } from '@drizzle-http/core'
import { noop } from '@drizzle-http/core'
import { Injectable } from '@nestjs/common'

export interface Party {
  id: string
  nome: string
}

@Injectable()
export class PartiesAPI {
  @GET('/partidos')
  @ContentType(MediaTypes.APPLICATION_JSON)
  @Accept(MediaTypes.APPLICATION_JSON)
  parties(@Query('sigla') acronym: string): Promise<{ dados: Party[] }> {
    return noop(acronym)
  }
}
