import EventEmitter from 'events'
import { TestId, TestResult } from '@drizzle-http/test-utils'
import { noop } from '@drizzle-http/core'
import { Abort, GET, H, Header, HeaderMap, P, Param, Path, Q, Query, QueryName, Timeout } from '..'

@HeaderMap({})
@Timeout(2, 2)
@Path('')
class API {
  @GET('/group/{id}/owner/{name}/projects')
  @HeaderMap({ 'Content-Type': 'application/json' })
  projects(
    @Param('id') id: string,
    @P('name') name: string,
    @Query('filter') filter: string[],
    @Q('sort') sort: string,
    @QueryName() prop: string,
    @Header('cache') cache: boolean,
    @H('code') code: number,
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
