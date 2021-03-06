import { AsJson, DrizzleBuilder, GET, HttpError, Param, Response, theTypes } from '@drizzle-http/core'
import { Observable } from 'rxjs'
import { closeTestServer, startTestServer, TestId, TestResult } from '@drizzle-http/test-utils'
import { RxJs, RxJsCallAdapterFactory } from './index'
import { UndiciCallFactory } from '@drizzle-http/undici'

@AsJson()
export class API {
  @GET('/{id}/projects')
  getRx(@Param('id') id: string): Observable<TestResult<TestId>> {
    return theTypes(Observable, TestResult)
  }

  @GET('/nowhere')
  @RxJs()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  nowhere(): Observable<TestResult<TestId>> {}

  @GET('/{id}/projects')
  nonRx(@Param('id') id: string): Promise<Response> {
    return theTypes(Promise, Response)
  }
}

describe('RxJs Call Adapter', () => {
  let api: API

  beforeAll(() =>
    startTestServer().then((addr: string) => {
      api = DrizzleBuilder.newBuilder()
        .baseUrl(addr)
        .callFactory(UndiciCallFactory.DEFAULT)
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

        return response.json()
      })
      .then((json: any) => {
        expect(json.params).toHaveProperty('id')
      })
  })
})
