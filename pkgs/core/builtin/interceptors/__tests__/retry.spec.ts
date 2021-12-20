import { Ok } from '@drizzle-http/test-utils'
import { setupTestServer } from '@drizzle-http/test-utils'
import { closeTestServer } from '@drizzle-http/test-utils'
import { startTestServer } from '@drizzle-http/test-utils'
import { ContentType } from '../../../decorators'
import { GET } from '../../../decorators'
import { Param } from '../../../decorators'
import { POST } from '../../../decorators'
import { MediaTypes } from '../../../MediaTypes'
import { noop } from '../../../noop'
import { Drizzle } from '../../../Drizzle'
import { DrizzleBuilder } from '../../../DrizzleBuilder'
import { TestCallFactory } from '../../../__tests__/TestCallFactory'
import { Retry } from '../Retry'
import { RetryInterceptorFactory } from '../RetryInterceptorFactory'
import { HttpError } from '../../../HttpError'
import { NoRetry } from '../NoRetry'

@ContentType(MediaTypes.APPLICATION_JSON)
class RetryTestAPI {
  @GET('/test/{id}')
  @Retry()
  retryable(@Param('id') id: string): Promise<Ok> {
    return noop(id)
  }

  @GET('/test/{id}')
  noRetryable(@Param('id') id: string): Promise<Ok> {
    return noop(id)
  }

  @POST('/test/{id}')
  @Retry({ delay: 100, statusCodes: [500], limit: 2, methods: ['PUT'] })
  noRetryForPost(@Param('id') id: string): Promise<Ok> {
    return noop(id)
  }

  @GET('/test/{id}')
  @Retry({ statusCodes: [404] })
  noRetryFor404(@Param('id') id: string): Promise<Ok> {
    return noop(id)
  }
}

@ContentType(MediaTypes.APPLICATION_JSON)
@Retry({ delay: 100 })
class RetryGlobalTestAPI {
  @GET('/test/{id}')
  retryable(@Param('id') id: string): Promise<Ok> {
    return noop(id)
  }

  @GET('/test/{id}')
  @Retry({ statusCodes: [404] })
  overwriteDefaults(@Param('id') id: string): Promise<Ok> {
    return noop(id)
  }

  @GET('/test/{id}')
  @NoRetry()
  noRetryable(@Param('id') id: string): Promise<Ok> {
    return noop(id)
  }
}

describe('Retry Interceptor', function () {
  let drizzle: Drizzle
  let retryApi: RetryTestAPI
  let retryDefApi: RetryGlobalTestAPI
  let c = 0

  const spy = jest.fn()
  const max = 3

  afterEach(() => {
    c = 0
    spy.mockReset()
  })

  beforeAll(() => {
    setupTestServer(fastify => {
      fastify.get('/test/:id', (req, res) => {
        if (c < max - 1) {
          c++
          spy()
          res.status(500).send({ ok: false })
        } else {
          res.status(200).send({ ok: true })
        }
      })
    })

    return startTestServer().then((addr: string) => {
      drizzle = DrizzleBuilder.newBuilder()
        .baseUrl(addr)
        .callFactory(TestCallFactory.INSTANCE)
        .addInterceptor(RetryInterceptorFactory.INSTANCE)
        .build()
      retryApi = drizzle.create(RetryTestAPI)
      retryDefApi = drizzle.create(RetryGlobalTestAPI)
    })
  })

  afterAll(async () => {
    await closeTestServer()
    await drizzle.shutdown()
  })

  describe('when class has no @Retry() decorator', function () {
    describe('and method is decorated with @Retry()', function () {
      it('should retry request according to the provided settings', async function () {
        const res = await retryApi.retryable('test')

        expect(res).toEqual({ ok: true })
        expect(spy).toHaveBeenCalledTimes(2)
      })
    })

    it('should not retry when method is not decorated with @Retry()', async function () {
      expect.assertions(3)

      try {
        await retryApi.noRetryable('test')
      } catch (ex) {
        const err = ex as HttpError

        expect(err).toBeDefined()
        expect(err.response.status).toEqual(500)
        expect(spy).toHaveBeenCalledTimes(1)
      }
    })

    it('should not retry when method is not in the allowed list', async function () {
      expect.assertions(2)

      try {
        await retryApi.noRetryForPost('test')
      } catch (ex) {
        const err = ex as HttpError

        expect(err.response.status).toEqual(500)
        expect(spy).not.toHaveBeenCalled()
      }
    })

    it('should not retry when status code is not in the allowed list', async function () {
      expect.assertions(2)

      try {
        await retryApi.noRetryFor404('test')
      } catch (ex) {
        const err = ex as HttpError

        expect(err.response.status).toEqual(500)
        expect(spy).toHaveBeenCalled()
      }
    })
  })

  describe('when class has a @Retry() setting global retry for all methods', function () {
    it('should retry request according to the provided settings', async function () {
      const res = await retryDefApi.retryable('test')

      expect(res).toEqual({ ok: true })
      expect(spy).toHaveBeenCalledTimes(2)
    })

    describe('and method has another @Retry() decorator', function () {
      it('should overwrite global settings', async function () {
        expect.assertions(2)

        try {
          await retryDefApi.overwriteDefaults('test')
        } catch (ex) {
          const err = ex as HttpError

          expect(err.response.status).toEqual(500)
          expect(spy).toHaveBeenCalledTimes(1)
        }
      })
    })

    describe('and method has @NoRetry() decorator', function () {
      it('should not retry', async function () {
        expect.assertions(2)

        try {
          await retryDefApi.noRetryable('test')
        } catch (ex) {
          const err = ex as HttpError

          expect(err.response.status).toEqual(500)
          expect(spy).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})
