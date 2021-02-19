'use strict'

import { DrizzleBuilder, GET, Query, theTypes } from '@drizzle-http/core'
import { CORS, FetchCallFactory, KeepAlive } from '@drizzle-http/fetch'

const PORT = process.env.PORT

class PartiesClientAPI {
  @GET('/')
  @CORS()
  @KeepAlive(true)
  parties(@Query('acronym') acronym) {
    return theTypes(Promise)
  }
}

const deputiesApi = DrizzleBuilder.newBuilder()
  .baseUrl(`http://localhost:${PORT}`)
  .callFactory(FetchCallFactory.DEFAULT)
  .build()
  .create(PartiesClientAPI)

export default deputiesApi
