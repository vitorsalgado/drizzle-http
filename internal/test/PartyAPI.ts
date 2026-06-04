/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { GET, Params } from '@drizzle-http/core'
import { ContentType } from '@drizzle-http/core'
import { MediaTypes } from '@drizzle-http/core'
import { Query } from '@drizzle-http/core'
import { Param } from '@drizzle-http/core'
import { Map } from '@drizzle-http/response-mapper-adapter'
import { Timeout } from '@drizzle-http/core'
import { CircuitBreaker } from '@drizzle-http/opossum-circuit-breaker'
import { toSimpleParty } from './models/partyMappers.js'
import { toParty } from './models/partyMappers.js'
import { PartySimple } from './models/party.js'
import { Party } from './models/party.js'
import { mapList } from './base/mapList.js'
import { Order } from './base/Order.js'
import { ApiResult } from './base/ApiResult.js'
import { mapSingle } from './base/mapSingle.js'
import { toDeputySimple } from './models/deputyMappers.js'
import { DeputySimple } from './models/deputy.js'

@ContentType(MediaTypes.APPLICATION_JSON)
@Timeout(15e3)
export class PartyAPI {
    @GET('/partidos')
  @Map(mapList(toSimpleParty))
  @CircuitBreaker()
  @Params([Query('sigla'), Query('dataInicio'), Query('dataFim'), Query('idLegislatura'), Query('pagina'), Query('itens'), Query('ordem'), Query('ordenarPor')])
  parties(sigla: string, dataInicio: string | null = null, dataFim: string | null = null, idLegislatura: number | null = null, pagina = 1, itens = 10, ordem: Order = Order.ASC, ordenarPor = 'nome'): Promise<ApiResult<PartySimple[]>> {}

    @GET('/partidos/{id}')
  @Map(mapSingle(toParty))
  @CircuitBreaker()
  @Params([Param('id')])
  partyById(id: number): Promise<ApiResult<Party>> {}

    @GET('/partidos/{id}/membros')
  @Map(mapSingle(toDeputySimple))
  @CircuitBreaker()
  @Params([Param('id')])
  partyMembers(id: number): Promise<ApiResult<DeputySimple>> {}
}
