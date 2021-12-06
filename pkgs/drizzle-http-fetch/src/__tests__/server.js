const { createServer } = require('http')

const port = process.env.SERVER_PORT || 3001
const sockets = new Set()

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

  if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].indexOf(req.method) > -1) {
    res.writeHead(200, 'OK', { ...{ 'Content-Type': 'text/plain; charset=utf-8' }, ...headers })
    res.write('success', 'utf-8')
    res.end()

    return
  }

  res.writeHead(405, headers)
  res.end(`${req.method} is not allowed for the request.`)
})

server.on('connection', socket => {
  sockets.add(socket)
  server.once('close', () => sockets.delete(socket))
})

server.on('error', console.error)

module.exports.start = function () {
  return server.listen(port)
}

module.exports.close = function (callback) {
  for (const socket of sockets) {
    socket.destroy()
    sockets.delete(socket)
  }

  server.close(callback)
}

exports.start()
