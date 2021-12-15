import { createServer } from 'http'

const port = process.env.SERVER_PORT || 3001

createServer((req, res) => {
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
    if ((req.url ?? '').indexOf('txt') > -1) {
      res.writeHead(200, 'OK', { ...{ 'Content-Type': 'text/plain' }, ...headers })
      res.write('success', 'utf-8')
      res.end()

      return
    } else if ((req.url ?? '').indexOf('json') > -1) {
      const buf = []

      req.on('data', chunk => buf.push(chunk))
      req.on('end', () => {
        res.writeHead(200, 'OK', { ...{ 'Content-Type': 'application/json' }, ...headers })
        res.write(
          JSON.stringify({
            status: 'ok',
            data: JSON.stringify(buf.join().toString())
          }),
          'utf-8'
        )
        res.end()
      })

      return
    }
  }

  res.writeHead(405, headers)
  res.end(`${req.method} is not allowed for the request.`)
})
  .listen(port)
  .on('error', console.error)
