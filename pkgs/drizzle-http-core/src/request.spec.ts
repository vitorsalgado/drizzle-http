import { Readable } from 'stream'
import { Request } from './request'
import { Headers } from './http.headers'

describe('Request', function () {
  const url = 'http://www.test.com.br/'

  it('should init with default values', function () {
    const request = new Request(url)

    expect(request.method).toStrictEqual('GET')
    expect(request.url).toStrictEqual(url)
    expect(request.headers).toStrictEqual(new Headers({}))
    expect(request.headersTimeout).toBeUndefined()
    expect(request.bodyTimeout).toBeUndefined()
    expect(request.body).toBeNull()
    expect(request.bodyUsed).toBeFalsy()
  })

  it('should fail when init a GET,HEAD or OPTIONS request with body', function () {
    expect(() => new Request(url, { body: new Readable() })).toThrow()
    expect(() => new Request(url, { method: 'GET', body: new Readable() })).toThrow()
    expect(() => new Request(url, { method: 'OPTIONS', body: new Readable() })).toThrow()
    expect(() => new Request(url, { method: 'HEAD', body: new Readable() })).toThrow()
  })

  it('should normalize http method', () => {
    expect(new Request(url, { method: 'post' }).method).toStrictEqual('POST')
  })
})
