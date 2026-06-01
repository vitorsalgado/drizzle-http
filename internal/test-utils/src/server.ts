/* eslint-disable @typescript-eslint/no-explicit-any */

import { fastify, type FastifyInstance, type FastifyPlugin, type FastifyReply, type FastifyRequest } from 'fastify'
import formbodyImport from 'fastify-formbody'

const formbody = (formbodyImport as unknown as { default: FastifyPlugin }).default ?? (formbodyImport as unknown as FastifyPlugin)

const server = fastify({ logger: false })

server.register(formbody)

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

server.setErrorHandler(function (this: FastifyInstance, error: Error, request: FastifyRequest, reply: FastifyReply) {
  this.log.error(error)

  reply.status(500).send({
    ok: false,
    error
  })
})

server.get('/', (request: FastifyRequest, reply: FastifyReply) => {
  reply.send(respond(request, { ok: true }))
})

server.post('/', (request: FastifyRequest, reply: FastifyReply) => {
  reply.send(respond(request, { ok: true }))
})

server.get<{ Params: { id: string } }>('/:id/projects', (request, reply) => {
  reply.send(respond(request, { id: request.params.id }))
})

server.get<{ Params: { id: string; name: string } }>('/group/:id/owner/:name/projects', (request, reply) => {
  reply.send(respond(request, { id: request.params.id }))
})

server.post('/:id/projects/:project', (request: FastifyRequest, reply: FastifyReply) => {
  reply.send(respond(request, { ok: true }))
})

// Server
// ----------

export const setupTestServer = (setup?: (f: FastifyInstance) => void) => setup?.(server)
export const startTestServer = (port = 0) => server.listen(port)
export const closeTestServer = () => server.close()

process.on('SIGINT', closeTestServer)
process.on('SIGTERM', closeTestServer)
