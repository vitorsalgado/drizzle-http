/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { GET } from '@drizzle-http/core'
import { ContentType } from '@drizzle-http/core'
import { MediaTypes } from '@drizzle-http/core'
import { Query } from '@drizzle-http/core'
import { Param } from '@drizzle-http/core'
import { Map } from '@drizzle-http/response-mapper-adapter'
import { Timeout } from '@drizzle-http/core'
import { CircuitBreaker } from '@drizzle-http/opossum-circuit-breaker'
import { toSimpleParty } from './models/partyMappers'
import { toParty } from './models/partyMappers'
import { PartySimple } from './models/party'
import { Party } from './models/party'
import { mapList } from './base/mapList'
import { Order } from './base/Order'
import { ApiResult } from './base/ApiResult'
import { mapSingle } from './base/mapSingle'
import { toDeputySimple } from './models/deputyMappers'
import { DeputySimple } from './models/deputy'

@ContentType(MediaTypes.APPLICATION_JSON)
@Timeout(15e3)
export class PartyAPI {
  @GET('/partidos')
  @Map(mapList(toSimpleParty))
  @CircuitBreaker()
  parties(
    @Query('sigla') sigla: string,
    @Query('dataInicio') dataInicio: string | null = null,
    @Query('dataFim') dataFim: string | null = null,
    @Query('idLegislatura') idLegislatura: number | null = null,
    @Query('pagina') pagina = 1,
    @Query('itens') itens = 10,
    @Query('ordem') ordem: Order = Order.ASC,
    @Query('ordenarPor') ordenarPor = 'nome'
  ): Promise<ApiResult<PartySimple[]>> {}

  @GET('/partidos/{id}')
  @Map(mapSingle(toParty))
  @CircuitBreaker()
  partyById(@Param('id') id: number): Promise<ApiResult<Party>> {}

  @GET('/partidos/{id}/membros')
  @Map(mapSingle(toDeputySimple))
  @CircuitBreaker()
  partyMembers(@Param('id') id: number): Promise<ApiResult<DeputySimple>> {}
}
