import {
  Call,
  Drizzle,
  DrizzleBuilder,
  GET,
  HttpResponse,
  noop,
  Param,
  RequestFactory,
  Params
} from '@drizzle-http/core'
import { CallAdapter } from '@drizzle-http/core'
import { CallAdapterFactory } from '@drizzle-http/core'
import { HttpRequest } from '@drizzle-http/core'
import { createMethodDecorator } from '@drizzle-http/core'
import { RawResponse } from '@drizzle-http/core'
import { ContentType } from '@drizzle-http/core'
import { MediaTypes } from '@drizzle-http/core'
import { closeTestServer, startTestServer, TestId, TestResult } from '@drizzle-http/test-utils'
import { UndiciCallFactory } from '@drizzle-http/undici'
import { firstValueFrom } from 'rxjs'
import { Observable } from 'rxjs'
import { RxJs } from '../RxJs.js'
import { RxJsCallAdapterFactory } from '../RxJsCallAdapterFactory.js'

function Custom() {
  return createMethodDecorator(Custom)
}

class CustomCallAdapterFactory implements CallAdapterFactory {
  provide(_drizzle: Drizzle, requestFactory: RequestFactory): CallAdapter<unknown, unknown> | null {
    if (requestFactory.hasDecorator(Custom)) {
      return {
        adapt(call: Call<unknown>): (request: HttpRequest, argv: unknown[]) => unknown {
          return (request, argv) =>
            call.execute(request, argv).then(data => ({ id: (data as { result: { id: string } }).result.id }))
        }
      }
    }

    return null
  }
}

@ContentType(MediaTypes.APPLICATION_JSON)
class API {
  @GET('/{id}/projects')
  @RxJs()
  @Params([Param('id')])
  getRx(id: string): Observable<TestResult<TestId>> {
    return noop(id)
  }

  @GET('/nowhere')
  @RxJs()
  nowhere(): Observable<TestResult<TestId>> {
    return noop()
  }

  @GET('/{id}/projects')
  @RawResponse()
  @Params([Param('id')])
  nonRx(id: string): Promise<HttpResponse> {
    return noop(id)
  }

  @GET('/{id}/projects')
  @RxJs()
  @Custom()
  @Params([Param('id')])
  decorated(id: string): Observable<TestId> {
    return noop(id)
  }
}

describe('RxJs Call Adapter', () => {
  let api: API
  let drizzle: Drizzle

  beforeAll(() =>
    startTestServer().then((addr: string) => {
      drizzle = DrizzleBuilder.newBuilder()
        .baseUrl(addr)
        .callFactory(new UndiciCallFactory())
        .addCallAdapterFactories(new RxJsCallAdapterFactory(new CustomCallAdapterFactory()))
        .build()
      api = drizzle.create(API)
    })
  )

  afterAll(async () => {
    await closeTestServer()
    await drizzle.shutdown()
  })

  it('should capture the success response on next', async () => {
    const result = await firstValueFrom(api.getRx('test-id'))

    expect(result.params).toHaveProperty('id')
  })

  it('should capture the error response on error() listener', async () => {
    await expect(firstValueFrom(api.nowhere())).rejects.toMatchObject({
      response: { status: 404 }
    })
  })

  it('should not use rxjs adapter when response type is not Observable', async () => {
    const response = await api.nonRx('test-id')

    expect(response.status).toEqual(200)
    expect(response.ok).toBeTruthy()

    const json = await response.json<TestResult<TestId>>()

    expect(json.params).toHaveProperty('id')
  })

  it('should execute decorated adapter and return response as rxjs', async () => {
    const result = await firstValueFrom(api.decorated('test-id'))

    expect(result.id).toEqual('test-id')
  })
})
