'use strict'

import { ContentType, DrizzleBuilder, GET, MediaTypes, Query } from '@drizzle-http/core'
import { CORS, FetchCallFactory, KeepAlive } from '@drizzle-http/fetch'
import { BrowserLoggingInterceptor, Level } from '@drizzle-http/logging-interceptor'

const PORT = process.env.PORT || 3001

class PartiesClientAPI {
  /**
   * @return Promise<{dados: [{id:number; sigla: string; nome:string; uri:string}]}>
   */
  @GET('/')
  @CORS()
  @KeepAlive(true)
  @ContentType(MediaTypes.APPLICATION_JSON)
  parties(@Query('acronym') acronym) {}
}

export const deputiesApi = DrizzleBuilder.newBuilder()
  .baseUrl(`http://localhost:${PORT}`)
  .callFactory(FetchCallFactory.DEFAULT)
  .addInterceptor(new BrowserLoggingInterceptor({ level: Level.BODY }))
  .build()
  .create(PartiesClientAPI)
