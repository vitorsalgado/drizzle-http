import { closeTestServer, setupTestServer, startTestServer } from '@drizzle-http/test-utils'
import {
  Body,
  ContentType,
  DELETE,
  Field,
  FormUrlEncoded,
  GET,
  Param,
  ParseErrorBody,
  PlainTextResponse,
  POST,
  PUT,
  UsePlainTextConv
} from '../decorators'
import { MediaTypes } from '../MediaTypes'
import { noop } from '../noop'
import { Drizzle } from '../Drizzle'
import { DrizzleBuilder } from '../DrizzleBuilder'
import { BuiltInConv, RawResponse } from '../builtin'
import { HttpResponse } from '../HttpResponse'
import { HttpError } from '../HttpError'
import { TestCallFactory } from './TestCallFactory'

interface User {
  id: string
  name: string
}

@ContentType(MediaTypes.APPLICATION_JSON)
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
  form(@Body() payload: unknown): Promise<unknown> {
    return noop(payload)
  }

  @POST('/form')
  @FormUrlEncoded()
  formFields(
    @Field('name') name: string,
    @Field('age') age: number,
    @Field('active') active: boolean
  ): Promise<unknown> {
    return noop(name, age, active)
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

  @GET('/error')
  nonParsedErrJson(): Promise<unknown> {
    return noop()
  }

  @POST('/error')
  @ParseErrorBody(BuiltInConv.TEXT)
  err(@Body() payload: unknown): Promise<unknown> {
    return noop(payload)
  }

  @POST('/error/empty')
  emptyErr(@Body() payload: unknown): Promise<unknown> {
    return noop(payload)
  }

  @POST('/error/empty')
  @ParseErrorBody(BuiltInConv.TEXT)
  emptyParsedErr(@Body() payload: unknown): Promise<unknown> {
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
        res.status(201).send({ id: (req.body as { id: string }).id })
      })
      fastify.delete('/customers/:id', (req, res) => {
        res.status(204).send()
      })
      fastify.put('/customers/:id', (req, res) => {
        res
          .status(204)
          .header('x-id', (req.params as { id: string }).id)
          .header('x-ctx', req.headers['x-ctx'])
          .send()
      })
      fastify.post('/form', (req, res) => {
        res.send(req.body)
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
      fastify.post('/error/empty', (req, res) => {
        res.status(400).send()
      })
      fastify.get('/error', (req, res) => {
        res.status(400).send({ message: 'fail' })
      })
    })

    return startTestServer().then((addr: string) => {
      drizzle = DrizzleBuilder.newBuilder()
        .baseUrl(addr)
        .callFactory(TestCallFactory.INSTANCE)
        .addInterceptor(chain => {
          chain.request().headers.append('x-ctx', 'node')
          return chain.proceed(chain.request())
        })
        .build()
      api = drizzle.create(RealApi)
    })
  })

  afterAll(async () => {
    await closeTestServer()
    await drizzle.shutdown()
  })

  describe('when posting form-url-encoded', function () {
    it('should send form body and return the json response from server', async function () {
      const form = { f1: 'field-1', f2: 'field-2' }
      const res = await api.form(form)

      expect(res).toEqual(form)
    })

    it('should form using parameters decorated with @Field() converting then to string when needed', async function () {
      const res = await api.formFields('dev', 33, true)

      expect(res).toEqual({ name: 'dev', age: '33', active: 'true' })
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
        expect(response.headers.get('x-ctx')).toEqual('node')
      })
    })

    it('should apply values set by the interceptor', function () {
      const id = 'test'
      return api.update(id, { name: 'new-name' }).then(response => {
        expect(response.ok).toBeTruthy()
        expect(response.status).toEqual(204)
        expect(response.headers.get('x-id')).toEqual(id)
        expect(response.headers.get('x-ctx')).toEqual('node')
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
          expect(err.response.body).toEqual({ message: 'Customer not found', code: 'ERR_NOT_FOUND' })
        })
      })

      it('should return error body parsed with custom converter', function () {
        expect.assertions(2)

        return api.err({ context: 'test' }).catch((err: HttpError) => {
          expect(err.response.status).toEqual(400)
          expect(err.response.body).toEqual('Fail')
        })
      })

      it('should return error empty body when server respond with no body and no converter is used', function () {
        expect.assertions(2)

        return api.emptyErr({ context: 'test' }).catch((err: HttpError) => {
          expect(err.response.status).toEqual(400)
          expect(err.response.body).toEqual('')
        })
      })
    })

    describe('and error response body is empty', function () {
      it('should return response and parse with custom converter without errors', function () {
        expect.assertions(2)

        return api.emptyParsedErr({ context: 'test' }).catch((err: HttpError) => {
          expect(err.response.status).toEqual(400)
          expect(err.response.body).toEqual('')
        })
      })
    })

    it('should consume error response and set http error body', function () {
      expect.assertions(2)

      return api.nonParsedErrJson().catch((err: HttpError) => {
        expect(err.response.status).toEqual(400)
        expect(err.response.body).toEqual('{"message":"fail"}')
      })
    })
  })
})
