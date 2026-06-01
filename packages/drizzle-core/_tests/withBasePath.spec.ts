import { closeTestServer } from '@drizzle-http/test-utils'
import { setupTestServer } from '@drizzle-http/test-utils'
import { startTestServer } from '@drizzle-http/test-utils'
import { GET } from '../decorators'
import { UsePlainTextConv } from '../decorators'
import { Path } from '../decorators'
import { HttpResponse } from '../HttpResponse'
import { noop } from '../noop'
import { Drizzle } from '../Drizzle'
import { RawResponse } from '../builtin'
import { DrizzleBuilder } from '../DrizzleBuilder'
import { TestCallFactory } from './TestCallFactory'

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
