import { createServer, IncomingMessage, ServerResponse } from 'http'
import { Body, DrizzleBuilder, HeaderMap, MediaTypes, Param, Params, POST, Query } from '@drizzle-http/core'
import { noop } from '@drizzle-http/core'
import { HttpResponse } from '@drizzle-http/core'
import { UndiciCallFactory } from '@drizzle-http/undici'
import { RawResponse } from '@drizzle-http/core'

const port = process.env.SENDER_PORT || 3000

class API {
    @POST('/test/{id}')
  @HeaderMap({ 'Content-Type': MediaTypes.APPLICATION_JSON })
  @RawResponse()
  @Params([Param('id'), Query('filter'), Body()])
  test(id: string, filter: string, data: unknown): Promise<HttpResponse> {
    return noop(id, filter, data)
  }
}

const api: API = DrizzleBuilder.newBuilder()
  .baseUrl(`http://localhost:${process.env.RECEIVER_PORT || 3001}`)
  .callFactory(new UndiciCallFactory())
  .build()
  .create(API)

createServer((_req: IncomingMessage, res: ServerResponse) => {
  api
    .test('100', 'active', {
      name: 'test',
      description: 'test-description'
    })
    .then(response => response.json())
    .then(json => {
      res.writeHead(200, 'OK', { 'Content-Type': 'application/json; charset=utf-8' })
      res.write(JSON.stringify(json), 'utf-8')
      res.end()
    })
})
  .listen(port)
  .on('error', console.error)
