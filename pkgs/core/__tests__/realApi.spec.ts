import { closeTestServer } from '@drizzle-http/test-utils'
import { setupTestServer } from '@drizzle-http/test-utils'
import { startTestServer } from '@drizzle-http/test-utils'
import { ContentType } from '../decorators'
import { GET } from '../decorators'
import { Param } from '../decorators'
import { POST } from '../decorators'
import { Body } from '../decorators'
import { FormUrlEncoded } from '../decorators'
import { UseJsonConv } from '../decorators'
import { PlainTextResponse } from '../decorators'
import { PUT } from '../decorators'
import { DELETE } from '../decorators'
import { UsePlainTextConv } from '../decorators'
import { ParseErrorBody } from '../decorators'
import { MediaTypes } from '../MediaTypes'
import { noop } from '../noop'
import { Drizzle } from '../Drizzle'
import { DrizzleBuilder } from '../DrizzleBuilder'
import { RawResponse } from '../builtin'
import { BuiltInConv } from '../builtin'
import { HttpResponse } from '../HttpResponse'
import { HttpError } from '../HttpError'
import { TestCallFactory } from './TestCallFactory'

interface User {
  id: string
  name: string
}

@ContentType(MediaTypes.APPLICATION_JSON)
@UseJsonConv()
class RealApi {
  @GET('/customers')
  list(): Promise<[{ name: string }]> {
    return noop()
  }

  @GET('/customers/{id}')
  @ParseErrorBody()
  byId(@Param('id') id: string): Promise<{ name: string }> {
    return noop(id)
  }

  @POST('/customers')
  create(@Body() user: User): Promise<{ id: string }> {
    return noop(user)
  }

  @PUT('/customers/{id}')
  @RawResponse()
  update(@Param('id') id: string, @Body() user: unknown): Promise<HttpResponse> {
    return noop(id, user)
  }

  @DELETE('/customers/{id}')
  remove(@Param('id') id: string): Promise<void> {
    return noop(id)
  }

  @POST('/form')
  @FormUrlEncoded()
  form(@Body() payload: unknown): Promise<{ name: string }> {
    return noop(payload)
  }

  @GET('/health')
  @PlainTextResponse()
  health(): Promise<string> {
    return noop()
  }

  @GET('/ping')
  @UsePlainTextConv()
  ping(): Promise<void> {
    return noop()
  }

  @POST('/error')
  @ParseErrorBody(BuiltInConv.TEXT)
  err(@Body() payload: unknown): Promise<unknown> {
    return noop(payload)
  }
}

describe('Given an API with JSON converter as default', function () {
  let drizzle: Drizzle
  let api: RealApi

  beforeAll(() => {
    setupTestServer(fastify => {
      fastify.get('/customers', (req, res) => {
        res.status(200).send([{ name: 'dev' }, { name: 'qa' }])
      })
      fastify.get('/customers/:id', (req, res) => {
        if ((req.params as Record<string, string>).id === '404') {
          res.status(404).send({ message: 'Customer not found', code: 'ERR_NOT_FOUND' })
          return
        }

        res.status(200).send({ name: (req.params as Record<string, string>).id })
      })
      fastify.post('/customers', (req, res) => {
        res.status(201).send({ id: (req.body as any).id })
      })
      fastify.delete('/customers/:id', (req, res) => {
        res.status(204).send()
      })
      fastify.put('/customers/:id', (req, res) => {
        res
          .status(204)
          .header('x-id', (req.params as any).id)
          .send()
      })
      fastify.post('/form', (req, res) => {
        res.send({ name: 'dev' })
      })
      fastify.get('/health', (req, res) => {
        res.status(200).send('ok')
      })
      fastify.get('/ping', (req, res) => {
        res.status(204).send()
      })
      fastify.post('/error', (req, res) => {
        res.status(400).send('Fail')
      })
    })

    return startTestServer().then((addr: string) => {
      drizzle = DrizzleBuilder.newBuilder().baseUrl(addr).callFactory(TestCallFactory.INSTANCE).build()
      api = drizzle.create(RealApi)
    })
  })

  afterAll(async () => {
    await closeTestServer()
    await drizzle.shutdown()
  })

  describe('when posting form-url-encoded to a endpoint that returns a JSON', function () {
    it('should return the parsed object', async function () {
      const res = await api.form({ f1: 'field-1', f2: 'field-2' })
      expect(res.name).toEqual('dev')
    })
  })

  describe('when server returns plain text and method is marked to use plain text converter', function () {
    it('should return plain text', async function () {
      const res = await api.health()
      expect(res).toEqual('ok')
    })
  })

  describe('when posting a json payload', function () {
    it('should send object converted to string to the server', function () {
      const id = 'test'
      return api.create({ id, name: 'some-nice-name' }).then(response => expect(response.id).toEqual(id))
    })
  })

  describe('when PUT with a path parameter and a JSON body', function () {
    it('should send all data to the server', function () {
      const id = 'test'
      return api.update(id, { name: 'new-name' }).then(response => {
        expect(response.ok).toBeTruthy()
        expect(response.status).toEqual(204)
        expect(response.headers.get('x-id')).toEqual(id)
      })
    })
  })

  describe('when DELETE and response is a Promise<void> and the server returns no body', function () {
    it('should send request and resolve response without errors', function () {
      return api.remove('id').then(response => {
        expect(response).toBeUndefined()
      })
    })
  })

  describe('when request and response are plain text', function () {
    it('should ', function () {
      return api.ping().then(response => {
        expect(response).toEqual('')
      })
    })
  })

  describe('when request fails with http error', function () {
    describe('and method is decorated with @ParseErrorBody()', function () {
      it('should return error body parsed with same converter used for success scenarios when no error type is specified', async function () {
        expect.assertions(2)

        return api.byId('404').catch((err: HttpError) => {
          expect(err.response.status).toEqual(404)
          expect(err.responseBody()).toEqual({ message: 'Customer not found', code: 'ERR_NOT_FOUND' })
        })
      })

      it('should return error body parsed with custom converter', function () {
        expect.assertions(2)

        return api.err({ context: 'test' }).catch((err: HttpError) => {
          expect(err.response.status).toEqual(400)
          expect(err.responseBody()).toEqual('Fail')
        })
      })
    })
  })
})
