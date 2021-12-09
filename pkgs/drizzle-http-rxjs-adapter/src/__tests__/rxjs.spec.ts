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
import { FullResponse } from '@drizzle-http/core'
import { CallAdapter } from '@drizzle-http/core'
import { CallAdapterFactory } from '@drizzle-http/core'
import { DrizzleMeta } from '@drizzle-http/core'
import { closeTestServer, startTestServer, TestId, TestResult } from '@drizzle-http/test-utils'
import { UndiciCallFactory } from '@drizzle-http/undici'
import { Observable } from 'rxjs'
import { RxJs } from '../RxJs'
import { RxJsCallAdapterFactory } from '../RxJsCallAdapterFactory'

function Custom() {
  return function (target: object, method: string): void {
    const requestFactory = DrizzleMeta.provideRequestFactory(target, method)
    requestFactory.addConfig('rxjs:test:custom', true)
  }
}

class CustomCallAdapter implements CallAdapter<unknown, Promise<unknown>> {
  adapt(action: Call<unknown>): Promise<unknown> {
    return action.execute().then(data => ({ id: (data as { result: { id: string } }).result.id }))
  }
}

class CustomCallAdapterFactory implements CallAdapterFactory {
  provideCallAdapter(
    _drizzle: Drizzle,
    _method: string,
    requestFactory: RequestFactory
  ): CallAdapter<unknown, unknown> | null {
    if (requestFactory.hasConfig('rxjs:test:custom')) {
      return new CustomCallAdapter()
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
  @FullResponse()
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

  beforeAll(() =>
    startTestServer().then((addr: string) => {
      api = DrizzleBuilder.newBuilder()
        .baseUrl(addr)
        .callFactory(new UndiciCallFactory())
        .addCallAdapterFactories(new RxJsCallAdapterFactory(new CustomCallAdapterFactory()))
        .build()
        .create(API)
    })
  )

  afterAll(() => closeTestServer())

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

  it('should capture the logErrorMsg response on logErrorMsg', done => {
    expect.assertions(1)

    api.nowhere().subscribe({
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
