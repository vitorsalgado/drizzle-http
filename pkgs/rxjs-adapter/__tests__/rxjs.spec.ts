import {
  AsJSON,
  Call,
  Drizzle,
  DrizzleBuilder,
  GET,
  HttpError,
  HttpResponse,
  noop,
  Param,
  RequestFactory
} from '@drizzle-http/core'
import { CallAdapter } from '@drizzle-http/core'
import { CallAdapterFactory } from '@drizzle-http/core'
import { HttpRequest } from '@drizzle-http/core'
import { createMethodDecorator } from '@drizzle-http/core'
import { RawResponse } from '@drizzle-http/core'
import { closeTestServer, startTestServer, TestId, TestResult } from '@drizzle-http/test-utils'
import { UndiciCallFactory } from '@drizzle-http/undici'
import { Observable } from 'rxjs'
import { RxJs } from '../RxJs'
import { RxJsCallAdapterFactory } from '../RxJsCallAdapterFactory'

function Custom() {
  return createMethodDecorator(Custom)
}

class CustomCallAdapterFactory implements CallAdapterFactory {
  provide(_drizzle: Drizzle, _method: string, requestFactory: RequestFactory): CallAdapter<unknown, unknown> | null {
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

@AsJSON()
class API {
  @GET('/{id}/projects')
  @RxJs()
  getRx(@Param('id') id: string): Observable<TestResult<TestId>> {
    return noop(id)
  }

  @GET('/nowhere')
  @RxJs()
  nowhere(): Observable<TestResult<TestId>> {
    return noop()
  }

  @GET('/{id}/projects')
  @RawResponse()
  nonRx(@Param('id') id: string): Promise<HttpResponse> {
    return noop(id)
  }

  @GET('/{id}/projects')
  @RxJs()
  @Custom()
  decorated(@Param('id') id: string): Observable<TestId> {
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

  it('should capture the success response on next', done => {
    expect.assertions(1)

    api.getRx('test-id').subscribe({
      next(x) {
        expect(x.params).toHaveProperty('id')
      },
      complete() {
        done()
      }
    })
  })

  it('should capture the error response on error() listener', done => {
    expect.assertions(1)

    api.nowhere().subscribe({
      next(model) {
        console.log(model)
        done()
      },
      error(err: HttpError) {
        expect(err.response.status).toEqual(404)
        done()
      }
    })
  })

  it('should not use rxjs adapter when response type is not Observable', () => {
    expect.assertions(3)

    return api
      .nonRx('test-id')
      .then(response => {
        expect(response.status).toEqual(200)
        expect(response.ok).toBeTruthy()

        return response.json<TestResult<TestId>>()
      })
      .then(json => expect(json.params).toHaveProperty('id'))
  })

  it('should execute decorated adapter and return response as rxjs', done => {
    expect.assertions(1)

    api.decorated('test-id').subscribe({
      next(x) {
        expect(x.id).toEqual('test-id')
      },
      complete() {
        done()
      }
    })
  })
})
