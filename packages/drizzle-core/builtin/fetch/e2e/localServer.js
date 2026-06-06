'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.closeServer = exports.startServer = void 0
const fastify_1 = require('fastify')
const fastify_multipart_1 = require('fastify-multipart')
const fastify_formbody_1 = require('fastify-formbody')
const fastify = (0, fastify_1.default)()
const port = process.env.SERVER_PORT || 3001
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT, DELETE, PATCH',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': 2592000
}
fastify.register(fastify_multipart_1.default, { addToBody: true, attachFieldsToBody: true })
fastify.register(fastify_formbody_1.default)
fastify.options('*', (req, res) => {
  res.headers(headers).status(204).send()
})
fastify.get('*', (req, res) => {
  console.log('Received GET')
  if ((req.url ?? '').indexOf('txt') > -1) {
    res.status(200).headers(headers).send('success')
  } else if ((req.url ?? '').indexOf('json') > -1) {
    res.status(200).headers(headers).send({ status: 'ok', data: req.body })
  } else {
    res.status(405).send('Not Allowed')
  }
})
fastify.post('/parts', async (req, res) => {
  const file = await req.file()
  const buf = []
  for await (const f of req.files()) {
    buf.push(f)
  }
  console.log(file)
  res.status(200).headers(headers).send('ok')
})
fastify.post('*', (req, res) => {
  if ((req.url ?? '').indexOf('txt') > -1) {
    res.status(200).headers(headers).send('success')
  } else if ((req.url ?? '').indexOf('json') > -1) {
    res.status(200).headers(headers).send({ status: 'ok', data: req.body })
  } else {
    res.status(405).send('Not Allowed')
  }
})
function startServer() {
  return fastify.listen(port)
}
exports.startServer = startServer
function closeServer() {
  return fastify.close()
}
exports.closeServer = closeServer
;(async () => await startServer())()
