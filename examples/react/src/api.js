'use strict'

import { AsJSON, ContentType, DrizzleBuilder, FullResponse, GET, MediaTypes, noop, Query } from '@drizzle-http/core'
import { CORS, FetchCallFactory, KeepAlive } from '@drizzle-http/fetch'
import { Level, LoggingInterceptor } from '@drizzle-http/logging-interceptor'

const PORT = process.env.PORT || 3001

class PartiesClientAPI {
  @GET('/')
  @ContentType(MediaTypes.APPLICATION_JSON_UTF8)
  @CORS()
  @KeepAlive(true)
  @AsJSON()
  parties(@Query('acronym') acronym) {
    return noop(Promise)
  }
}

export const deputiesApi = DrizzleBuilder.newBuilder()
  .baseUrl(`http://localhost:${PORT}`)
  .callFactory(FetchCallFactory.DEFAULT)
  .addInterceptor(new LoggingInterceptor(Level.BODY))
  .build()
  .create(PartiesClientAPI)
