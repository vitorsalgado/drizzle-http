import { Abort, GET, H, Header, HeaderMap, P, Param, Path, Q, Query, QueryName, theTypes, Timeout } from './'
import { TestId, TestResult } from '@drizzle-http/test-utils'
import EventEmitter from 'events'

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
    return theTypes(Promise, TestResult, id, name, filter, sort, prop, cache, code)
  }
}

describe('Drizzle Http', function () {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  it('should load all modules correctly', () => {})
})
