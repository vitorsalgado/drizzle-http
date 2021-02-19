#!/usr/bin/env node

'use strict'

/* eslint-disable */

import { DrizzleBuilder, GET, Query, theTypes } from '@drizzle-http/core'
import { Streaming, StreamTo, StreamToHttpError, UndiciCallFactory } from '@drizzle-http/undici'
import { createServer } from 'http'
import { Writable } from 'stream'
import url from 'url'

class PartiesAPI {
  @GET('/partidos')
  @Streaming()
  parties(@Query('sigla') acronym: string, @StreamTo() target: Writable) {
    return theTypes(Promise)
  }
}

const partiesAPI = DrizzleBuilder.newBuilder()
  .baseUrl('https://dadosabertos.camara.leg.br/api/v2/')
  .callFactory(UndiciCallFactory.DEFAULT)
  .build()
  .create(PartiesAPI)

const port = parseInt(String(process.env.PORT || 3001))

createServer(
  (req, res) => {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT, DELETE, PATCH',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': 2592000
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204, cors)
      res.end()
      return
    }

    const query = url.parse(req.url as string, true).query
    const header = { 'Content-Type': 'application/json;charset=utf-8' }
    const charset = 'utf-8'

    res.setHeader('Content-Type', 'application/json;charset=utf-8')
    res.writeHead(200, { ...header, ...cors })

    partiesAPI
      .parties(query.acronym, res)
      .then(() => {
        if (res.headersSent) {
          return res.end()
        }
      })
      .catch((err: StreamToHttpError) => {
        res.writeHead(500, 'Internal Server Error', { ...header, ...cors })
        res.write(JSON.stringify({ error: err.stack }), charset)
        res.end()
      })
  })
  .listen(port)
  .on('error', console.error)
