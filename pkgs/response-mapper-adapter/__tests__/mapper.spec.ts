import { GET } from '@drizzle-http/core'
import { noop } from '@drizzle-http/core'
import { ContentType } from '@drizzle-http/core'
import { MediaTypes } from '@drizzle-http/core'
import { Drizzle } from '@drizzle-http/core'
import { DrizzleBuilder } from '@drizzle-http/core'
import { setupTestServer } from '@drizzle-http/test-utils'
import { closeTestServer } from '@drizzle-http/test-utils'
import { startTestServer } from '@drizzle-http/test-utils'
import { UndiciCallFactory } from '@drizzle-http/undici'
import { Map } from '../decorators'
import { MapTo } from '../decorators'
import { MapCallAdapterFactory } from '../MapCallAdapterFactory'

class Service {
  constructor(private readonly value: string) {}

  test(): string {
    return this.value
  }
}

const service = new Service('pkg')
const data = [{ context: 'test' }, { context: 'dev' }]

interface Item {
  context: string
}

interface DataItems {
  data: Array<Item>
}

class Result {
  private static readonly service: Service = new Service('static')
  readonly mapped: Array<Item>

  constructor(response: DataItems) {
    this.mapped = response.data.map(x => ({
      context: x.context
    }))
  }

  static build(response: DataItems): Result {
    return new Result({ data: [response.data.pop() ?? ({} as Item)] })
  }

  static async buildAsync(response: DataItems): Promise<Result> {
    return new Promise(resolve => {
      setTimeout(() => resolve(new Result({ data: [response.data.pop() ?? ({} as Item)] })), 250)
    })
  }

  static buildWithStaticService(): Result {
    return new Result({ data: [{ context: Result.service.test() }] })
  }

  static buildWithOutsideService(): Result {
    return new Result({ data: [{ context: service.test() }] })
  }
}

@ContentType(MediaTypes.APPLICATION_JSON)
class TestApi {
  @GET('/map')
  noMap(): Promise<DataItems> {
    return noop()
  }

  @GET('/map')
  @Map<DataItems, Array<Item>>(response => response.data.map(x => ({ context: x.context })))
  map(): Promise<Array<Item>> {
    return noop()
  }

  @GET('/map')
  @MapTo(Result)
  mapToCtor(): Promise<Result> {
    return noop()
  }

  @GET('/map')
  @MapTo(Result, Result.build)
  mapToStatic(): Promise<Result> {
    return noop()
  }

  @GET('/map')
  @MapTo(Result, Result.buildAsync)
  asyncMap(): Promise<Result> {
    return noop()
  }

  @GET('/map')
  @MapTo(Result, Result.buildWithStaticService)
  buildWithStaticService(): Promise<Result> {
    return noop()
  }

  @GET('/map')
  @MapTo(Result, Result.buildWithOutsideService)
  buildWithPackageService(): Promise<Result> {
    return noop()
  }
}

describe('Map Adapter', function () {
  let drizzle: Drizzle
  let api: TestApi

  beforeAll(async () => {
    setupTestServer(fastify => {
      fastify.get('/map', (req, res) => {
        res.status(200).send({ data })
      })
    })

    await startTestServer().then((addr: string) => {
      drizzle = DrizzleBuilder.newBuilder()
        .baseUrl(addr)
        .callFactory(new UndiciCallFactory())
        .addCallAdapterFactories(new MapCallAdapterFactory())
        .build()
      api = drizzle.create(TestApi)
    })
  })

  afterAll(() => Promise.all([closeTestServer(), drizzle.shutdown()]))

  describe('when no map decorator is used', function () {
    it('should return response as is', async function () {
      const list = await api.noMap()

      expect(list).toEqual({ data })
    })
  })

  describe('when method is decorated with @Map()', function () {
    it('should return mapped response according to the mapper in @Map()', async function () {
      const list = await api.map()

      expect(list).toEqual(data)
    })
  })

  describe('when method is decorated with @MapTo()', function () {
    describe('and informed just a class type parameter', function () {
      it('should return type initialized using the constructor', async function () {
        const result = await api.mapToCtor()

        expect(result.mapped).toEqual(data)
      })
    })

    describe('and informed a static factory method', function () {
      it('should build result from using the static method', async function () {
        const result = await api.mapToStatic()

        expect(result.mapped).toEqual([{ context: 'dev' }])
      })
    })

    describe('and informed a static async factory method', function () {
      it('should build result from resolved promise result', async function () {
        const result = await api.asyncMap()

        expect(result.mapped).toEqual([{ context: 'dev' }])
      })
    })

    describe('and target type factory method uses external services', function () {
      it('should build result from method that uses a static service instance', async function () {
        const result = await api.buildWithStaticService()

        expect(result.mapped).toEqual([{ context: 'static' }])
      })

      it('should build result from method that uses package service instance', async function () {
        const result = await api.buildWithPackageService()

        expect(result.mapped).toEqual([{ context: 'pkg' }])
      })
    })
  })
})
