#!/usr/bin/env node

/* eslint-disable */

import { DrizzleBuilder, GET, Params, Query } from '@drizzle-http/core'
import { noop } from '@drizzle-http/core'
import { StreamTo, UndiciCallFactory } from '@drizzle-http/undici'
import { Streaming } from '@drizzle-http/undici'
import { StreamingResponse } from '@drizzle-http/undici'
import { createServer, ServerResponse } from 'http'
import { Writable } from 'stream'
import url from 'url'

class PartiesAPI {
  @GET('/partidos')
  @Streaming({
    onHeaders: ({ statusCode, headers, destination }) => {
      const res = destination as ServerResponse
      res.writeHead(statusCode, headers)
      return destination
    }
  })
  @Params([Query('sigla'), StreamTo()])
  parties(acronym: string, target: Writable): Promise<StreamingResponse> {
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

  if (req.method === 'POST') {
    res.writeHead(405, 'Method Not Allowed', { 'Content-Type': 'application/json', ...cors })
    res.end(JSON.stringify({ error: 'Method Not Allowed' }))
    return
  }

  partiesAPI
    .parties(query.acronym as string, res)
    .then(async response => {
      Object.entries(cors).forEach(([key, value]) => {
        if (!res.headersSent) {
          res.setHeader(key, value)
        }
      })

      if (!response.ok) {
        await response.completed
        if (!res.headersSent) {
          res.writeHead(response.status, { 'Content-Type': 'application/json', ...cors })
        }
        res.end()
        return
      }

      await response.completed

      if (!res.writableEnded) {
        res.end()
      }
    })
    .catch(err => {
      if (!res.headersSent) {
        res.writeHead(500, 'Internal Server Error', { 'Content-Type': 'application/json', ...cors })
      }

      res.end(JSON.stringify({ error: err.message }))
    })
})
  .listen(port)
  .on('error', console.error)
