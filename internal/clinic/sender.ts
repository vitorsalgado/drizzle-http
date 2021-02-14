import { createServer, IncomingMessage, ServerResponse } from 'http'
import { Body, Drizzle, HeaderMap, MediaTypes, Param, POST, Query, Response, theTypes } from '@drizzle-http/core'
import { UndiciCallFactory } from '@drizzle-http/undici'

const port = process.env.SENDER_PORT || 3000

class API {
  @POST('/test/{id}')
  @HeaderMap({ 'Content-Type': MediaTypes.APPLICATION_JSON_UTF8 })
  test(@Param('id') id: string, @Query('filter') filter: string, @Body() data: any): Promise<Response> {
    return theTypes(Promise, Response)
  }
}

const api: API = Drizzle.builder()
  .baseUrl(`http://localhost:${process.env.RECEIVER_PORT || 3001}`)
  .callFactory(new UndiciCallFactory())
  .build()
  .create(API)

createServer(
  (_req: IncomingMessage, res: ServerResponse) => {
    api.test('100', 'active', { name: 'test', description: 'test-description' })
      .then(response => response.json())
      .then(json => {
        res.writeHead(200, 'OK', { 'Content-Type': 'application/json; charset=utf-8' })
        res.write(JSON.stringify(json), 'utf-8')
        res.end()
      })
  })
  .listen(port)
  .on('error', console.error)
