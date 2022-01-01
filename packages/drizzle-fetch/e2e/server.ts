import Fastify from 'fastify'
import FastifyMultipart from 'fastify-multipart'
import FastifyFormBody from 'fastify-formbody'

const fastify = Fastify()
const port = process.env.SERVER_PORT || 3001
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT, DELETE, PATCH',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': 2592000
}

fastify.register(FastifyMultipart, { addToBody: true, attachFieldsToBody: true })
fastify.register(FastifyFormBody)

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

export function startServer() {
  return fastify.listen(port)
}

export function closeServer() {
  return fastify.close()
}
