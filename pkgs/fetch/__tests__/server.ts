import { createServer } from 'http'
import { Socket } from 'net'

const port = process.env.SERVER_PORT || 3001
const sockets = new Set<Socket>()

const server = createServer((req, res) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT, DELETE, PATCH',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Max-Age': 2592000
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers)
    res.end()
    return
  }

  if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].indexOf(req.method as string) > -1) {
    if ((req.url ?? '').indexOf('txt') > -1) {
      res.writeHead(200, 'OK', { ...{ 'Content-Type': 'text/plain' }, ...headers })
      res.write('success', 'utf-8')
      res.end()

      return
    } else if ((req.url ?? '').indexOf('json') > -1) {
      const buf: Buffer[] = []

      req.on('data', chunk => buf.push(chunk))
      req.on('end', () => {
        res.writeHead(200, 'OK', { ...{ 'Content-Type': 'application/json' }, ...headers })
        res.write(JSON.stringify({ status: 'ok', data: JSON.parse(buf.join().toString()) }), 'utf-8')
        res.end()
      })

      return
    }
  }

  res.writeHead(405, headers)
  res.end(`${req.method} is not allowed for the request.`)
})

server.on('connection', socket => {
  sockets.add(socket)
  server.once('close', () => sockets.delete(socket))
})

server.on('error', console.error)

export function startServer() {
  return server.listen(port)
}

export function closeServer(callback?: ((err?: Error | undefined) => void) | undefined) {
  for (const socket of sockets) {
    socket.destroy()
    sockets.delete(socket)
  }

  server.close(callback)
}
