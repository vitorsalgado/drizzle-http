import {
  Abort,
  Body,
  Drizzle,
  DrizzleBuilder,
  GET,
  H,
  Header,
  HeaderMap,
  P,
  Param,
  Path,
  POST,
  Q,
  Query,
  QueryName,
  Response,
  theTypes,
  Timeout
} from '../src'
import { closeTestServer, Data, Ok, startTestServer, TestId, TestResult } from '@drizzle-http/test-utils'
import { TestCallFactory } from './internal/http/test'
import EventEmitter from 'events'

@HeaderMap({})
@Timeout(2, 2)
@Path('')
class API {
  @GET('/')
  @HeaderMap({ 'Content-Type': 'application/json', 'X-Env': 'Test' })
  get(): Promise<TestResult<Ok>> {
    return theTypes(Promise, TestResult)
  }

  @GET('/group/{id}/owner/{name}/projects')
  @HeaderMap({ 'Content-Type': 'application/json' })
  projects(
    @Param('id') id: string,
    @P('name') name: string,
    @Query('filter') filter: string[],
    @Q('sort') sort: string,
    @QueryName() prop: string,
    @Header('cache') cache: boolean,
    @H('code') code: number,
    @Abort() abort: EventEmitter
  ): Promise<TestResult<TestId>> {
    return theTypes(Promise, TestResult, id, name, filter, sort, prop, cache, code)
  }

  @GET('/{id}/projects')
  getRaw(@Param('id') id: string, @Query('sort') orderBy: string): Promise<Response> {
    return theTypes(Promise, Response, id, orderBy)
  }

  @POST('/{id}/projects/{project}')
  @HeaderMap({ 'content-type': 'application/json; charset=UTF-8' })
  post(@Param('id') id: string, @Param('project') project: string, @Body() data: Data): Promise<TestResult<Ok>> {
    return theTypes(Promise, TestResult, id, project, data)
  }
}

describe('Drizzle', () => {
  let drizzle: Drizzle
  let api: API

  beforeAll(() =>
    startTestServer().then((addr: string) => {
      drizzle = DrizzleBuilder.newBuilder()
        .baseUrl(addr)
        .useDefaults()
        .callFactory(TestCallFactory.INSTANCE)
        .addDefaultHeader('Content-Type', 'application/json')
        .build()
      api = drizzle.create(API)
    })
  )

  afterAll(() => Promise.all([closeTestServer(), drizzle.shutdown()]))

  it('should call simple / route and parse AsJson response', () =>
    api.get().then(response => {
      expect(response.headers).toHaveProperty('content-type', 'application/json')
      expect(response.headers).toHaveProperty('x-env', 'Test')
      expect(response.result.ok).toBeTruthy()
    }))

  it('should should send all specified arguments in the request respecting decorators setupTestServer', () => {
    const id = 'bbbcc31f-94ea-4b20-a184-644e8f3b5f15'
    const name = 'cool name'
    const filter = ['active', 'without debt']
    const prop = 'withProp(standard)'
    const sort = 'asc'
    const cache = true
    const code = 666
    const ee = new EventEmitter()

    return api.projects(id, name, filter, sort, prop, cache, code, ee).then(response => {
      expect(response.result.id).toEqual(id)
      expect(response.query).toHaveProperty('filter', filter)
      expect(response.query).toHaveProperty('sort', sort)
      expect(response.query).toHaveProperty(prop)
      expect(response.params).toHaveProperty('id', id)
      expect(response.params).toHaveProperty('name', name)
      expect(response.headers).toHaveProperty('content-type', 'application/json')
      expect(response.headers).toHaveProperty('cache', String(cache))
      expect(response.headers).toHaveProperty('code', String(code))
      expect(response.url.substring(response.url.length - 1)).not.toEqual('&')
    })
  })

  it('should return raw http response when response handledType is "raw" and return handledType is Response', () => {
    const id = 'test'
    const orderBy = 'desc'
    return api.getRaw(id, orderBy).then(response => {
      expect(response.ok).toBeTruthy()
      expect(response.status).toEqual(200)

      return response.json<TestResult<TestId>>().then(parsed => {
        expect(parsed.result.id).toEqual(id)
        expect(parsed.params.id).toEqual(id)
        expect(parsed.query).toHaveProperty('sort', orderBy)
      })
    })
  })

  it('should post json body data', () => {
    const id = 'RE-281028190'
    const project = 'test-project-3780921'
    const body = { description: 'description is unnecessary', active: true, meta: { type: 'none', more: [100, 200] } }

    return api.post(id, project, body).then(response => {
      expect(response.result.ok).toBeTruthy()
      expect(response.body).toEqual(body)
    })
  })
})
