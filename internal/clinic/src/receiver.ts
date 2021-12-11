import { createServer, IncomingMessage, ServerResponse } from 'http'

const port = process.env.RECEIVER_PORT || 3001

createServer((_req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(200, 'OK', { 'Content-Type': 'application/json; charset=utf-8' })
  res.write('{ "status": "ok" }', 'utf-8')
  res.end()
})
  .listen(port)
  .on('error', console.error)
