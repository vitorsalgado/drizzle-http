import { closeTestServer, startTestServer, TestId, TestResult } from '@drizzle-http/test-utils'
import { Drizzle } from '../../../../Drizzle'
import { GET, Param } from '../../../../decorators'
import { ContentType } from '../../../../decorators'
import { UseJsonConv } from '../../../../decorators'
import { DrizzleBuilder } from '../../../../DrizzleBuilder'
import { HttpError } from '../../../../HttpError'
import { Callback } from '../Callback'
import { noop } from '../../../../noop'
import { TestCallFactory } from '../../../../__tests__/TestCallFactory'
import { MediaTypes } from '../../../../MediaTypes'

@ContentType(MediaTypes.APPLICATION_JSON)
@UseJsonConv()
class API {
  @GET('/{id}/projects')
  @Callback()
  getCallback(@Param('id') id: string, callback: (err: Error, data: TestResult<TestId>) => void): void {
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
