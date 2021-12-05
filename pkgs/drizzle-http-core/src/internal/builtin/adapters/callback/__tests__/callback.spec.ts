import { closeTestServer, startTestServer, TestId, TestResult } from '@drizzle-http/test-utils'
import { any, callbackTypes } from '../../../../../response.type.detector'
import { Drizzle } from '../../../../../drizzle'
import { AsJSON, GET, Param } from '../../../../../decorators'
import { TestCallFactory } from '../../../../http/test'
import { DrizzleBuilder } from '../../../../../drizzle.builder'
import { HttpError } from '../../../../../http.error'
import { Callback } from '..'

class API {
  @GET('/{id}/projects')
  @AsJSON()
  @Callback()
  getCallback(@Param('id') id: string, callback: (err: Error, data: TestResult<TestId>) => void): void {
    return callbackTypes(TestResult, id, callback)
  }

  @GET('/nowhere')
  @Callback()
  err(callback: (err: HttpError, data: unknown) => void): void {
    return any(callback)
  }
}

describe('Callback Call Adapter - @Callback decorated', function () {
  let drizzle: Drizzle
  let api: API

  beforeAll(() =>
    startTestServer().then((addr: string) => {
      drizzle = DrizzleBuilder.newBuilder()
        .baseUrl(addr)
        .useDefaults()
        .callFactory(TestCallFactory.INSTANCE)
        .addDefaultHeader('Content-Type', 'application/json')
        .build()
      api = drizzle.create(API)
    })
  )

  afterAll(() => Promise.all([closeTestServer(), drizzle.shutdown()]))

  it('should return the response in the callback function', done => {
    api.getCallback('test', (error: Error, data: TestResult<TestId>) => {
      expect(error).toBeNull()
      expect(data.result.id).toEqual('test')
      done()
    })
  })

  it('should call the callback with the error when integration fails', done => {
    api.err((error: HttpError) => {
      expect(error).not.toBeNull()
      expect(error.request).not.toBeNull()
      expect(error.response).not.toBeNull()
      done()
    })
  })
})
