import { AsJSON, DrizzleBuilder, GET, HttpError, HttpResponse, noop, Param } from '@drizzle-http/core'
import { FullResponse } from '@drizzle-http/core'
import { closeTestServer, startTestServer, TestId, TestResult } from '@drizzle-http/test-utils'
import { UndiciCallFactory } from '@drizzle-http/undici'
import { Observable } from 'rxjs'
import { RxJs } from '../RxJs'
import { RxJsCallAdapterFactory } from '../RxJsCallAdapterFactory'

@AsJSON()
export class API {
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
}

describe('RxJs Call Adapter', () => {
  let api: API

  beforeAll(() =>
    startTestServer().then((addr: string) => {
      api = DrizzleBuilder.newBuilder()
        .baseUrl(addr)
        .callFactory(new UndiciCallFactory())
        .addCallAdapterFactories(RxJsCallAdapterFactory.INSTANCE)
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
})
