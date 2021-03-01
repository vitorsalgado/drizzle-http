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
    expect(
      () =>
        new Request(url, {
          method: 'GET',
          body: new Readable()
        })
    ).toThrow()
    expect(
      () =>
        new Request(url, {
          method: 'OPTIONS',
          body: new Readable()
        })
    ).toThrow()
    expect(
      () =>
        new Request(url, {
          method: 'HEAD',
          body: new Readable()
        })
    ).toThrow()
  })

  it('should normalize http method', () => {
    expect(new Request(url, { method: 'post' }).method).toStrictEqual('POST')
  })

  it('should init with a request as arg', function () {
    const base = new Request(url)
    const request = new Request(base)

    expect(request.method).toStrictEqual('GET')
    expect(request.url).toStrictEqual(url)
    expect(request.headers).toStrictEqual(new Headers({}))
    expect(request.headersTimeout).toBeUndefined()
    expect(request.bodyTimeout).toBeUndefined()
    expect(request.body).toBeNull()
    expect(request.bodyUsed).toBeFalsy()
  })

  it('should clone request with same values', function () {
    const request = new Request(url, {
      method: 'POST',
      headers: { header: 'value' }
    })
    const clone = request.clone()

    expect(clone.method).toStrictEqual('POST')
    expect(clone.url).toStrictEqual(url)
    expect(clone.headers).toStrictEqual(new Headers({ header: 'value' }))
    expect(clone.headersTimeout).toBeUndefined()
    expect(clone.bodyTimeout).toBeUndefined()
    expect(clone.body).toBeNull()
    expect(clone.bodyUsed).toBeFalsy()
  })

  it('should fail when cloning with used body', async function () {
    function* txt() {
      yield 'start'
      yield '-'
      yield 'end'
    }

    const request = new Request(url, {
      method: 'POST',
      body: Readable.from(txt(), { objectMode: false })
    })

    await request.text()

    expect(() => request.clone()).toThrowError()
  })
})
