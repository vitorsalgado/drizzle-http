import { noop } from '@drizzle-http/core'
import { GET } from '@drizzle-http/core'
import { Query } from '@drizzle-http/core'
import { Drizzle } from '@drizzle-http/core'
import { DrizzleBuilder } from '@drizzle-http/core'
import { Param } from '@drizzle-http/core'
import { Header } from '@drizzle-http/core'
import { ContentType } from '@drizzle-http/core'
import { MediaTypes } from '@drizzle-http/core'
import { UndiciCallFactory } from '@drizzle-http/undici'
import { closeTestServer } from '@drizzle-http/test-utils'
import { setupTestServer } from '@drizzle-http/test-utils'
import { startTestServer } from '@drizzle-http/test-utils'
import OpossumCircuitBreaker from 'opossum'
import { CircuitBreaker } from '../decorators'
import { Fallback } from '../decorators'
import { CircuitBreakerRegistry } from '../CircuitBreakerRegistry'
import { CircuitBreakerCallAdapterFactory } from '../CircuitBreakerCallAdapterFactory'

const opts = {
  timeout: 100,
  volumeThreshold: 6,
  errorThresholdPercentage: 50
}

@ContentType(MediaTypes.APPLICATION_JSON)
class API {
  @GET('/no-circuit-breaker')
  noCircuitBreaker(): Promise<{ name: string }> {
    return noop()
  }

  @GET('/circuit-breaker/{id}')
  @CircuitBreaker({
    name: undefined,
    group: 'nice-group'
  })
  circuitBreaker(
    @Param('id') id: string,
    @Query('filter') filter: string,
    @Header('test') test: string
  ): Promise<{ id: string; filter: string; test: string }> {
    return noop(id, filter, test)
  }

  @GET('/long-running')
  @CircuitBreaker({ ...opts })
  longRunning(): Promise<{ ok: boolean }> {
    return noop()
  }

  @GET('/long-running')
  @CircuitBreaker({ ...opts })
  fallback(@Query('filter') filter: string, @Query('page') page: number): Promise<{ ok: string }> {
    return noop(filter, page)
  }

  @GET('/long-running')
  @CircuitBreaker({ ...opts })
  @Fallback('custom')
  differentFallback(@Query('filter') filter: string, @Query('page') page: number): Promise<{ ok: string }> {
    return noop(filter, page)
  }

  @GET('/long-running')
  @CircuitBreaker({ ...opts })
  @Fallback(async (filter: string, page: string, error: Error): Promise<{ ok: string }> => {
    expect(Array.isArray(filter)).toBeFalsy()
    expect(filter).toBeDefined()
    expect(page).toBeDefined()
    expect(error).toBeDefined()

    return { ok: 'fallback worked - function' + ' - filter: ' + filter + ' - page: ' + String(page) }
  })
  functionFallback(@Query('filter') filter: string, @Query('page') page: number): Promise<{ ok: string }> {
    return noop(filter, page)
  }
}

class MessageService {
  message(): string {
    return 'fallback worked'
  }
}

class Fallbacks {
  constructor(private readonly messageService: MessageService) {}

  readonly prop: string = 'test'

  fallback(filter: string, page: string, error: Error): Promise<{ ok: string }> {
    expect(Array.isArray(filter)).toBeFalsy()
    expect(filter).toBeDefined()
    expect(page).toBeDefined()
    expect(error).toBeDefined()

    return Promise.resolve({ ok: this.messageService.message() + ' - filter: ' + filter + ' - page: ' + String(page) })
  }

  custom(filter: string, page: string, error: Error): Promise<{ ok: string }> {
    expect(Array.isArray(filter)).toBeFalsy()
    expect(filter).toBeDefined()
    expect(page).toBeDefined()
    expect(error).toBeDefined()

    return Promise.resolve({
      ok: this.messageService.message() + ' - custom' + ' - filter: ' + filter + ' - page: ' + String(page)
    })
  }
}

describe('Circuit Breaker', function () {
  const srvSpy = jest.fn()
  const options: OpossumCircuitBreaker.Options = {}
  const registry = new CircuitBreakerRegistry()

  let address = ''
  let drizzle: Drizzle
  let api: API

  beforeAll(async () => {
    setupTestServer(fastify => {
      fastify.get('/long-running', (req, res) => {
        srvSpy()
        setTimeout(() => res.status(200).send({ name: 'finally' }), 5000)
      })
      fastify.get('/no-circuit-breaker', (req, res) => {
        res.status(200).send({ name: 'test' })
      })
      fastify.get('/circuit-breaker/:id', (req, res) => {
        res.status(200).send({
          id: (req.params as Record<string, string>).id,
          filter: (req.query as Record<string, string>).filter,
          test: req.headers.test
        })
      })
    })

    await startTestServer().then((addr: string) => {
      address = addr
      drizzle = DrizzleBuilder.newBuilder()
        .baseUrl(addr)
        .callFactory(new UndiciCallFactory())
        .addCallAdapterFactories(
          new CircuitBreakerCallAdapterFactory({
            options: {
              name: 'test-',
              group: 'tg:'
            },
            registry,
            fallbacks: new Fallbacks(new MessageService())
          })
        )
        .build()
      api = drizzle.create(API)
    })
  })

  afterAll(async () => {
    await closeTestServer()
    await drizzle.shutdown()
  })

  it('should execute function normally when method has no @UseCircuitBreaker() decorator', function () {
    return api.noCircuitBreaker().then(model => {
      expect(model.name).toEqual('test')
    })
  })

  it('should use method to name circuit breaker when none is specified', async function () {
    class DefaultName {
      @GET('/circuit-breaker/{id}')
      @CircuitBreaker()
      defaultName(@Param('id') id: string): Promise<unknown> {
        return noop(id)
      }
    }

    const factory = new CircuitBreakerCallAdapterFactory({
      options,
      registry,
      fallbacks: new Fallbacks(new MessageService())
    })
    const d = DrizzleBuilder.newBuilder()
      .baseUrl(address)
      .callFactory(new UndiciCallFactory())
      .addCallAdapterFactories(factory)
      .build()

    const api = d.create(DefaultName)

    await api.defaultName('test')

    expect(factory.circuitBreakerRegistry().find('defaultName')?.name).toEqual('defaultName')
  })

  it('should fail when circuit breaker name is repeated', function () {
    class RepeatedNameApi {
      @GET('/')
      @CircuitBreaker({ name: 'test' })
      test1(): Promise<unknown> {
        return noop()
      }

      @GET('/')
      @CircuitBreaker({ name: 'test' })
      test2(): Promise<unknown> {
        return noop()
      }
    }

    expect(() =>
      DrizzleBuilder.newBuilder()
        .baseUrl(address)
        .callFactory(new UndiciCallFactory())
        .addCallAdapterFactories(
          new CircuitBreakerCallAdapterFactory({
            options,
            registry,
            fallbacks: new Fallbacks(new MessageService())
          })
        )
        .build()
        .create(RepeatedNameApi)
    ).toThrowError()
  })

  describe('when api is stable', function () {
    it('should perform request with all parameters and return response normally', function () {
      const cb = registry.find('circuitBreaker')
      const id = 'test-id'
      const filter = 'none'
      const test = 'ok'

      return api.circuitBreaker(id, filter, test).then(data => {
        expect(data.id).toEqual(id)
        expect(data.filter).toEqual(filter)
        expect(data.test).toEqual(test)
        expect(cb).toBeDefined()
      })
    })
  })

  describe('when api is unstable', function () {
    it('should eventually trip the circuit', async function () {
      for (const _ of Array.from(Array(10))) {
        await api.longRunning().catch(err => expect(err).toBeDefined())
      }

      const cb = registry.find('test-longRunning')

      expect(cb?.opened).toBeTruthy()
      expect(srvSpy).toHaveBeenCalledTimes(6)

      cb?.close()

      await api.longRunning().catch(err => expect(err).toBeDefined())

      expect(srvSpy).toHaveBeenCalledTimes(7)
    })

    it('should call the fallback method that has the same name as the original method', function () {
      const filter = 'fallback'
      const page = 10

      return api.fallback(filter, page).then(res => {
        expect(res.ok).toEqual(`fallback worked - filter: ${filter} - page: ${page}`)
      })
    })

    it('should call the fallback function from Fallbacks class specified via decorator @Fallback', function () {
      const filter = 'different fallback from class'
      const page = 20

      return api.differentFallback(filter, page).then(res => {
        expect(res.ok).toEqual(`fallback worked - custom - filter: ${filter} - page: ${page}`)
      })
    })

    it('should call the fallback function from @Fallback decorator', function () {
      const filter = 'function'
      const page = 30

      return api.functionFallback(filter, page).then(res => {
        expect(res.ok).toEqual(`fallback worked - function - filter: ${filter} - page: ${page}`)
      })
    })

    it('should fail when function ', function () {
      class StringRefWithoutFallbacksClazzApi {
        @GET('/')
        @CircuitBreaker()
        @Fallback('someMethod')
        test(): Promise<unknown> {
          return noop()
        }
      }

      const d = DrizzleBuilder.newBuilder()
        .baseUrl(address)
        .callFactory(new UndiciCallFactory())
        .addCallAdapterFactories(
          new CircuitBreakerCallAdapterFactory({
            options,
            registry
          })
        )
        .build()

      expect(() => d.create(StringRefWithoutFallbacksClazzApi)).toThrowError()
    })

    it("should fail when method specified on @Fallback() doesn't exists in the fallbacks instance provided in the factory", function () {
      class NoMethod {
        @GET('/')
        @CircuitBreaker()
        @Fallback('nonexistent')
        test(): Promise<unknown> {
          return noop()
        }
      }

      const d = DrizzleBuilder.newBuilder()
        .baseUrl(address)
        .callFactory(new UndiciCallFactory())
        .addCallAdapterFactories(
          new CircuitBreakerCallAdapterFactory({
            options,
            registry,
            fallbacks: new Fallbacks(new MessageService())
          })
        )
        .build()

      expect(() => d.create(NoMethod)).toThrowError()
    })

    it('should fail when method specified on @Fallback() is not a function', function () {
      class NoMethod {
        @GET('/')
        @CircuitBreaker()
        @Fallback('prop')
        test(): Promise<unknown> {
          return noop()
        }
      }

      const d = DrizzleBuilder.newBuilder()
        .baseUrl(address)
        .callFactory(new UndiciCallFactory())
        .addCallAdapterFactories(
          new CircuitBreakerCallAdapterFactory({
            options,
            registry,
            fallbacks: new Fallbacks(new MessageService())
          })
        )
        .build()

      expect(() => d.create(NoMethod)).toThrowError()
    })
  })

  it('should init with default values', async function () {
    class Def {
      @GET('/')
      @CircuitBreaker({ name: 'test' })
      test(): Promise<unknown> {
        return noop()
      }
    }

    const d = DrizzleBuilder.newBuilder()
      .baseUrl(address)
      .callFactory(new UndiciCallFactory())
      .addCallAdapterFactories(new CircuitBreakerCallAdapterFactory())
      .build()

    const api = d.create(Def)

    await api.test()
    await d.shutdown()
  })
})
