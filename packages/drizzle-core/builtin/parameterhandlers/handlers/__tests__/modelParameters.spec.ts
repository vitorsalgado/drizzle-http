import { closeTestServer } from '@drizzle-http/test-utils'
import { setupTestServer } from '@drizzle-http/test-utils'
import { startTestServer } from '@drizzle-http/test-utils'
import { TestResult } from '@drizzle-http/test-utils'
import { Ok } from '@drizzle-http/test-utils'
import { respond } from '@drizzle-http/test-utils'
import { POST } from '../../../../decorators'
import { ToHeader } from '../../../../decorators'
import { ToParam } from '../../../../decorators'
import { ToQueryName } from '../../../../decorators'
import { ToQuery } from '../../../../decorators'
import { GET } from '../../../../decorators'
import { Model } from '../../../../decorators'
import { ContentType } from '../../../../decorators'
import { ToBody } from '../../../../decorators'
import { ToBodyParty } from '../../../../decorators'
import { ToField } from '../../../../decorators'
import { FormUrlEncoded } from '../../../../decorators'
import { HeaderMap } from '../../../../decorators'
import { Param } from '../../../../decorators'
import { Body } from '../../../../decorators'
import { noop } from '../../../../noop'
import { Drizzle } from '../../../../Drizzle'
import { DrizzleBuilder } from '../../../../DrizzleBuilder'
import { TestCallFactory } from '../../../../__tests__/TestCallFactory'
import { MediaTypes } from '../../../../MediaTypes'
import { RawResponse } from '../../../converters/raw'
import { HttpResponse } from '../../../../HttpResponse'

class Search {
  @ToHeader('trace-id')
  static traceId = 'traceId'

  @ToHeader('x-correlation-id')
  correlationId!: string

  @ToParam('id')
  id!: string

  @ToParam()
  type!: string

  @ToQueryName()
  ignore!: string

  @ToQuery()
  sort!: string

  @ToQuery('filter')
  filtering!: string

  constructor(correlationId: string, id: string, type: string, ignore: string, sort: string, filtering: string) {
    this.correlationId = correlationId
    this.id = id
    this.type = type
    this.ignore = ignore
    this.sort = sort
    this.filtering = filtering
  }
}

class CtorModel {
  constructor(@ToQuery('filter') readonly filter: string, @ToQuery('sort') readonly sort: string) {}
}

class ModelWithMethods {
  @ToQuery()
  static sort(): string {
    return 'asc'
  }

  @ToHeader()
  'trace-id'(): string {
    return '100'
  }

  @ToQuery('filter')
  getFilter(): string {
    return 'all'
  }
}

class Register {
  @ToParam('id')
  identifier!: number

  @ToBody()
  payload!: { name: string; active: boolean }
}

class BodyParts {
  @ToParam('id')
  identifier!: number

  @ToBodyParty()
  name!: string

  @ToBodyParty('active')
  isActive!: boolean

  @ToBodyParty()
  address!: { street: string; num: number }
}

class FormFields {
  @ToField()
  name!: string

  @ToField()
  age!: number
}

@ContentType(MediaTypes.APPLICATION_JSON)
class TestModelApi {
  @GET('/{id}/{type}')
  search1(@Model(Search) search: Search): Promise<TestResult<Ok>> {
    return noop(search)
  }

  @GET('/{id}/{type}')
  search2(@Model(Search) search: Search): Promise<TestResult<Ok>> {
    return noop(search)
  }

  @GET('/')
  ctorModel(@Model(CtorModel) model: CtorModel): Promise<TestResult<Ok>> {
    return noop(model)
  }

  @GET('/')
  mapMethods(@Model(ModelWithMethods) model: ModelWithMethods): Promise<TestResult<Ok>> {
    return noop(model)
  }

  @POST('/test')
  send(@Model(Search) model: Search): Promise<Response> {
    return noop(model)
  }

  @POST('/{id}')
  body(@Model(Register) model: Register): Promise<TestResult<Ok>> {
    return noop(model)
  }

  @POST('/{id}')
  bodyParts(@Model(BodyParts) model: BodyParts): Promise<TestResult<Ok>> {
    return noop(model)
  }

  @POST('/form')
  @FormUrlEncoded()
  @RawResponse()
  form(@Model(FormFields) model: FormFields): Promise<HttpResponse> {
    return noop(model)
  }

  @POST('/{id}')
  @HeaderMap({ 'x-context': 'test' })
  multiple(
    @Param('id') id: string,
    @Model(CtorModel) model: CtorModel,
    @Body() body: { name: string }
  ): Promise<TestResult<Ok>> {
    return noop(id, model, body)
  }
}

describe('Search Parameter Handler', function () {
  let drizzle: Drizzle
  let api: TestModelApi

  beforeAll(() => {
    setupTestServer(fastify => {
      fastify.all('/:id/:type', (req, res) => {
        res.send(respond(req, req.body))
      })

      fastify.post('/:id', (req, res) => {
        res.send(respond(req, req.body))
      })

      fastify.post('/form', (req, res) => {
        res.send(respond(req, req.body))
      })
    })

    return startTestServer().then(addr => {
      drizzle = DrizzleBuilder.newBuilder().baseUrl(addr).callFactory(TestCallFactory.INSTANCE).build()
      api = drizzle.create(TestModelApi)
    })
  })

  afterAll(async () => {
    await closeTestServer()
    await drizzle.shutdown()
  })

  it('should exec a GET request with values from argument decorated elements', async function () {
    const correlationId = 'correlation-id'
    const traceId = 'traceId'
    const id = 'identifier'
    const type = 'some-type'
    const ignore = 'ignore()'
    const sort = 'asc'
    const filtering = 'all'

    const result = await api.search1({
      correlationId,
      id,
      type,
      ignore,
      sort,
      filtering
    })

    expect(result.headers).toHaveProperty('x-correlation-id', correlationId)
    expect(result.headers).toHaveProperty('trace-id', traceId)
    expect(result.params).toHaveProperty('id', id)
    expect(result.params).toHaveProperty('type', type)
    expect(result.query).toHaveProperty(ignore)
    expect(result.query).toHaveProperty('sort', sort)
    expect(result.query).toHaveProperty('filter', filtering)
  })

  it('should exec a similar GET request with values from shared argument decorated elements', async function () {
    const correlationId = 'correlation-id'
    const traceId = 'traceId'
    const id = 'identifier'
    const type = 'some-type'
    const ignore = 'ignore()'
    const sort = 'asc'
    const filtering = 'all'

    const result = await api.search2(new Search(correlationId, id, type, ignore, sort, filtering))

    expect(result.headers).toHaveProperty('x-correlation-id', correlationId)
    expect(result.headers).toHaveProperty('trace-id', traceId)
    expect(result.params).toHaveProperty('id', id)
    expect(result.params).toHaveProperty('type', type)
    expect(result.query).toHaveProperty(ignore)
    expect(result.query).toHaveProperty('sort', sort)
    expect(result.query).toHaveProperty('filter', filtering)
  })

  it('should map model with values from constructor decorated elements', async function () {
    const sort = 'desc'
    const filter = 'all'

    const result = await api.ctorModel(new CtorModel(filter, sort))

    expect(result.query).toHaveProperty('filter', filter)
    expect(result.query).toHaveProperty('sort', sort)
  })

  it('should map model with values from decorated methods', async function () {
    const result = await api.mapMethods(new ModelWithMethods())

    expect(result.query).toHaveProperty('filter', 'all')
    expect(result.query).toHaveProperty('sort', 'asc')
    expect(result.headers).toHaveProperty('trace-id', '100')
  })

  it('should build body from decorated property', async function () {
    const payload = {
      name: 'test',
      active: true
    }
    const data = {
      identifier: 50,
      payload
    }
    const res = await api.body(data)

    expect(res.params).toHaveProperty('id', '50')
    expect(res.result).toEqual(payload)
  })

  it('should build body part by part using properties with @ToBodyParty() decorator', async function () {
    const id = 100
    const result = await api.bodyParts({
      identifier: id,
      name: 'test-name',
      isActive: false,
      address: {
        street: 'nowhere',
        num: 404
      }
    })

    expect(result.params).toHaveProperty('id', String(id))
    expect(result.result).toEqual({
      name: 'test-name',
      isActive: false,
      address: {
        street: 'nowhere',
        num: 404
      }
    })
  })

  it('should post form url encoded fields based on decorated properties', async function () {
    const res = await api.form({
      name: 'test',
      age: 33
    })
    const json = await res.json<TestResult<{ name: string; age: number }>>()

    expect(json.result).toEqual({
      name: 'test',
      age: '33'
    })
  })

  it('should send request considering all decorated elements', async function () {
    const id = 'test-id'
    const sort = 'desc'
    const filter = 'all'
    const body = { name: 'hello world' }

    const result = await api.multiple(id, new CtorModel(filter, sort), body)

    expect(result.query).toHaveProperty('filter', filter)
    expect(result.query).toHaveProperty('sort', sort)
    expect(result.params).toHaveProperty('id', id)
    expect(result.headers).toHaveProperty('x-context', 'test')
    expect(result.result).toEqual(body)
  })

  it('should fail when constructor decorated parameter doest not provide a key or a field identifier', function () {
    expect(function () {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Test {
        constructor(
          @ToQuery()
          readonly prop: string
        ) {}
      }
    }).toThrowError()
  })

  it('should fail when providing a field name using property decorators', function () {
    expect(function () {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Test {
        constructor(
          @ToQuery(undefined, 'no-key')
          readonly prop: string
        ) {}
      }
    }).toThrowError()
  })
})
