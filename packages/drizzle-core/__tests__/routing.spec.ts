import { closeTestServer } from '@drizzle-http/test-utils'
import { startTestServer } from '@drizzle-http/test-utils'
import { setupTestServer } from '@drizzle-http/test-utils'
import { GET } from '../decorators'
import { UsePlainTextConv } from '../decorators'
import { Path } from '../decorators'
import { HttpResponse } from '../HttpResponse'
import { noop } from '../noop'
import { Drizzle } from '../Drizzle'
import { DrizzleBuilder } from '../DrizzleBuilder'
import { RawResponse } from '../builtin'
import { HTTP } from '../decorators'
import { TestCallFactory } from './TestCallFactory'

@UsePlainTextConv()
@Path('/customers')
class RouteApi {
  @GET()
  @RawResponse()
  noPath(): Promise<HttpResponse> {
    return noop()
  }

  @HTTP('GET')
  @RawResponse()
  usingHTTP(): Promise<HttpResponse> {
    return noop()
  }
}

describe('With @Path()', function () {
  let drizzle: Drizzle
  let api: RouteApi

  beforeAll(() => {
    setupTestServer(fastify => {
      fastify.get('/customers', (req, res) => {
        res.status(200).send('ok')
      })
    })

    return startTestServer().then((addr: string) => {
      drizzle = DrizzleBuilder.newBuilder().baseUrl(addr).callFactory(TestCallFactory.INSTANCE).build()
      api = drizzle.create(RouteApi)
    })
  })

  afterAll(async () => {
    await closeTestServer()
    await drizzle.shutdown()
  })

  describe('when using @Path()', function () {
    describe('and method does not contain a path', function () {
      it('should GET /customers without trailing slash', async function () {
        const res = await api.noPath()
        const txt = await res.text()

        expect(res.status).toEqual(200)
        expect(res.ok).toBeTruthy()
        expect(txt).toEqual('ok')
      })
    })
  })

  describe('when using @HTTP()', function () {
    it('should use custom http method from @HTTP() decorator', async function () {
      const res = await api.usingHTTP()
      const txt = await res.text()

      expect(res.status).toEqual(200)
      expect(res.ok).toBeTruthy()
      expect(txt).toEqual('ok')
    })
  })
})
