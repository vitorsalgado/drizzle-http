import { closeTestServer } from '@drizzle-http/test-utils'
import { setupTestServer } from '@drizzle-http/test-utils'
import { startTestServer } from '@drizzle-http/test-utils'
import { To } from '../../../../decorators/To'
import { noop } from '../../../../noop'
import { POST } from '../../../../decorators'
import { Drizzle } from '../../../../Drizzle'
import { DrizzleBuilder } from '../../../../DrizzleBuilder'
import { TestCallFactory } from '../../../../__tests__/TestCallFactory'

class Model {
  @To('header')
  static readonly prop: string

  @To('header')
  correlationId!: string
}

class TestModelApi {
  @POST('/test')
  send(model: Model): Promise<Response> {
    return noop(model)
  }
}

describe('aa', function () {
  let drizzle: Drizzle
  let api: TestModelApi

  beforeAll(() => {
    setupTestServer(fastify => {
      fastify.all('/test', (req, res) => {
        res.status(200).send({ test: 'ok' })
      })
    })

    return startTestServer().then((addr: string) => {
      drizzle = DrizzleBuilder.newBuilder().baseUrl(addr).callFactory(TestCallFactory.INSTANCE).build()
      api = drizzle.create(TestModelApi)
    })
  })

  afterAll(async () => {
    await closeTestServer()
    await drizzle.shutdown()
  })

  it('should ', function () {
    const hey = new Model()

    expect(hey).toBeDefined()
  })
})
