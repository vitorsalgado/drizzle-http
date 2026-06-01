import { closeTestServer } from '@drizzle-http/test-utils'
import { setupTestServer } from '@drizzle-http/test-utils'
import { startTestServer } from '@drizzle-http/test-utils'
import { GET } from '../decorators/index.js'
import { UsePlainTextConv } from '../decorators/index.js'
import { Path } from '../decorators/index.js'
import { HttpResponse } from '../HttpResponse.js'
import { noop } from '../noop.js'
import { Drizzle } from '../Drizzle.js'
import { RawResponse } from '../builtin/index.js'
import { DrizzleBuilder } from '../DrizzleBuilder.js'
import { TestCallFactory } from './TestCallFactory.js'

@UsePlainTextConv()
@Path('/customers')
class RouteApi {
  @GET()
  @RawResponse()
  test(): Promise<HttpResponse> {
    return noop()
  }
}

describe('Base Path Setup', function () {
  let drizzle: Drizzle
  let api: RouteApi

  beforeAll(() => {
    setupTestServer(fastify => {
      fastify.get('/v1/customers', (req, res) => {
        res.status(200).send('v1-ok')
      })
    })

    return startTestServer().then((addr: string) => {
      drizzle = DrizzleBuilder.newBuilder()
        .baseUrl(addr + '/v1')
        .callFactory(TestCallFactory.INSTANCE)
        .build()
      api = drizzle.create(RouteApi)
    })
  })

  afterAll(async () => {
    await closeTestServer()
    await drizzle.shutdown()
  })

  describe('when setting a base path on setup', function () {
    it('should request considering the path from setup and decorator', async function () {
      const res = await api.test()
      const txt = await res.text()

      expect(res.status).toEqual(200)
      expect(res.ok).toBeTruthy()
      expect(txt).toEqual('v1-ok')
    })
  })
})
