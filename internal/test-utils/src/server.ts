/* eslint-disable @typescript-eslint/no-explicit-any */

import Fastify, { FastifyInstance, FastifyRequest } from 'fastify'
import FastifyFormBody from 'fastify-formbody'

const fastify = Fastify({ logger: false })

fastify.register(FastifyFormBody)

export const respond = (req: FastifyRequest, obj: any): unknown => ({
  url: req.url,
  headers: req.headers,
  query: req.query,
  params: req.params,
  body: req.body,
  method: req.method,
  result: obj
})

// Routes
// ----------

fastify.setErrorHandler(function (error: Error, request, reply) {
  this.log.error(error)

  reply.status(500).send({
    ok: false,
    error
  })
})

fastify.get('/', (request, reply) => {
  reply.send(respond(request, { ok: true }))
})

fastify.post('/', (request, reply) => {
  reply.send(respond(request, { ok: true }))
})

fastify.get('/:id/projects', (request: any, reply) => {
  reply.send(respond(request, { id: request.params.id }))
})

fastify.get('/group/:id/owner/:name/projects', (request: any, reply) => {
  reply.send(respond(request, { id: request.params.id }))
})

fastify.post('/:id/projects/:project', (request, reply) => {
  reply.send(respond(request, { ok: true }))
})

// Server
// ----------

export const setupTestServer = (setup?: (f: FastifyInstance) => void) => setup?.(fastify)
export const startTestServer = (port = 0) => fastify.listen(port)
export const closeTestServer = () => fastify.close()

process.on('SIGINT', closeTestServer)
process.on('SIGTERM', closeTestServer)
