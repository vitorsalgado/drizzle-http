import { closeTestServer, startTestServer, TestId, TestResult } from '@drizzle-http/test-utils'
import { Drizzle } from '../../../../Drizzle.js'
import { GET, Param, Params } from '../../../../decorators/index.js'
import { ContentType } from '../../../../decorators/index.js'
import { UseJsonConv } from '../../../../decorators/index.js'
import { DrizzleBuilder } from '../../../../DrizzleBuilder.js'
import { HttpError } from '../../../../HttpError.js'
import { Callback } from '../Callback.js'
import { noop } from '../../../../noop.js'
import { TestCallFactory } from '../../../../_tests/TestCallFactory.js'
import { MediaTypes } from '../../../../MediaTypes.js'

@ContentType(MediaTypes.APPLICATION_JSON)
@UseJsonConv()
class API {
  @GET('/{id}/projects')
  @Callback()
  @Params([Param('id')])
  getCallback(id: string, callback: (err: Error, data: TestResult<TestId>) => void): void {
    return noop(id, callback)
  }

  @GET('/nowhere')
  @Callback()
  err(callback: (err: HttpError, data: unknown) => void): void {
    return noop(callback)
  }
}

describe('Callback Call Adapter - @Callback decorated', function () {
  let drizzle: Drizzle
  let api: API

  beforeAll(() =>
    startTestServer().then((addr: string) => {
      drizzle = DrizzleBuilder.newBuilder().baseUrl(addr).useDefaults().callFactory(TestCallFactory.INSTANCE).build()
      api = drizzle.create(API)
    })
  )

  afterAll(() => Promise.all([closeTestServer(), drizzle.shutdown()]))

  it('should return the response in the callback function', async () => {
    await new Promise<void>((resolve, reject) => {
      api.getCallback('test', (error: Error, data: TestResult<TestId>) => {
        try {
          expect(error).toBeNull()
          expect(data.result.id).toEqual('test')
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    })
  })

  it('should call the callback with the error when integration fails', async () => {
    await new Promise<void>((resolve, reject) => {
      api.err((error: HttpError) => {
        try {
          expect(error).not.toBeNull()
          expect(error.request).not.toBeNull()
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    })
  })
})
