/* eslint-disable @typescript-eslint/no-unused-vars */

import EventEmitter from 'events'
import { TestId, TestResult } from '@drizzle-http/test-utils'
import { noop } from '@drizzle-http/core'
import { Param } from '@drizzle-http/core'
import { Query } from '@drizzle-http/core'
import { Header } from '@drizzle-http/core'
import { Abort } from '@drizzle-http/core'
import { HeaderMap } from '@drizzle-http/core'
import { Timeout } from '@drizzle-http/core'
import { GET } from '@drizzle-http/core'
import { QueryName } from '@drizzle-http/core'
import { Path } from '@drizzle-http/core'

@HeaderMap({})
@Timeout(2, 2)
@Path('')
class API {
  @GET('/group/{id}/owner/{name}/projects')
  @HeaderMap({ 'Content-Type': 'application/json' })
  projects(
    @Param('id') id: string,
    @Param('name') name: string,
    @Query('filter') filter: string[],
    @Query('sort') sort: string,
    @QueryName() prop: string,
    @Header('cache') cache: boolean,
    @Header('code') code: number,
    @Abort() abort: EventEmitter
  ): Promise<TestResult<TestId>> {
    return noop(id, name, filter, sort, prop, cache, code, abort)
  }
}

describe('Drizzle Http', function () {
  it('should load all modules correctly', () => {
    // Just test if imports and annotations work
  })
})
