#!/usr/bin/env node

/* eslint-disable */

import { DrizzleBuilder, GET, HttpError, Query } from '@drizzle-http/core'
import { noop } from '@drizzle-http/core'
import { StreamTo, UndiciCallFactory } from '@drizzle-http/undici'
import { Streaming } from '@drizzle-http/undici'
import { StreamingResponse } from '@drizzle-http/undici'
import { createServer } from 'http'
import { Writable } from 'stream'
import url from 'url'

class PartiesAPI {
  @GET('/partidos')
  @Streaming()
  parties(@Query('sigla') acronym: string, @StreamTo() target: Writable): Promise<StreamingResponse> {
    return noop(acronym, target)
  }
}

const partiesAPI = DrizzleBuilder.newBuilder()
  .baseUrl('https://dadosabertos.camara.leg.br/api/v2/')
  .callFactory(new UndiciCallFactory())
  .build()
  .create(PartiesAPI)

const port = parseInt(String(process.env.PORT || 3001))

createServer((req, res) => {
  console.error('TEST')

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
  const header = { 'Content-Type': 'application/json' }
  const charset = 'utf-8'

  if (req.method === 'POST') {
    res.writeHead(405, 'Method Not Allowed', { ...header, ...cors })
    res.write(JSON.stringify({ error: 'Method Not Allowed' }), charset)
    res.end()
  }

  res.setHeader('Content-Type', 'application/json')
  res.writeHead(200, { ...header, ...cors })

  partiesAPI
    .parties(query.acronym as string, res)
    .then(() => {
      if (res.headersSent) {
        return res.end()
      }
    })
    .catch((err: HttpError) => {
      res.writeHead(500, 'Internal Server Error', { ...header, ...cors })
      res.write(JSON.stringify({ error: err.message }), charset)
      res.end()
    })
})
  .listen(port)
  .on('error', console.error)
