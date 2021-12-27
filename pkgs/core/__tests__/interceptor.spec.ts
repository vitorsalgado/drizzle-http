import { Ok } from '@drizzle-http/test-utils'
import { TestResult } from '@drizzle-http/test-utils'
import { setupTestServer } from '@drizzle-http/test-utils'
import { startTestServer } from '@drizzle-http/test-utils'
import { closeTestServer } from '@drizzle-http/test-utils'
import { HeaderMap } from '../decorators'
import { GET } from '../decorators'
import { Header } from '../decorators'
import { ContentType } from '../decorators'
import { RawResponse } from '../builtin'
import { HttpResponse } from '../HttpResponse'
import { noop } from '../noop'
import { initDrizzleHttp } from '../DrizzleBuilder'
import { MediaTypes } from '../MediaTypes'
import { TestCallFactory } from './TestCallFactory'

@ContentType(MediaTypes.APPLICATION_JSON)
@HeaderMap({ clazz: 'clazz' })
class InterceptorAPI {
  @GET('/')
  @HeaderMap({ method: 'method' })
  @RawResponse()
  test(@Header('param') param: string): Promise<HttpResponse> {
    return noop(param)
  }
}

describe.skip('when using interceptors', function () {
  let address = ''

  beforeAll(() => {
    setupTestServer(fastify => {
      fastify.all('/test', (req, res) => {
        res.status(200).send({ test: 'ok' })
      })
    })

    return startTestServer().then((addr: string) => {
      address = addr
    })
  })

  afterAll(async () => {
    await closeTestServer()
  })

  it('should execute the interceptor and apply changes to the request', function () {
    expect.assertions(5)

    const spy = jest.fn()
    const value = 'interceptor-header-value'

    const d = initDrizzleHttp()
      .baseUrl(address)
      .callFactory(TestCallFactory.INSTANCE)
      .addInterceptor(chain => {
        chain.request().headers.append('interceptor', value)
        spy()
        return chain.proceed(chain.request())
      })
      .build()

    const api: InterceptorAPI = d.create(InterceptorAPI)

    return api
      .test('param')
      .then(res => res.json<TestResult<Ok>>())
      .then(result => {
        expect(result.headers.clazz).toEqual('clazz')
        expect(result.headers.method).toEqual('method')
        expect(result.headers.param).toEqual('param')
        expect(result.headers.interceptor).toEqual(value)
        expect(spy).toHaveBeenCalledTimes(1)
      })
      .finally(() => d.shutdown())
  })
})
