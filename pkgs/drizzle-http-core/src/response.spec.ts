import { Response } from './response'
import { Readable } from 'stream'
import { Headers } from './http.headers'

describe('Response', function () {
  function * txt() {
    yield 'start'
    yield '-'
    yield 'end'
  }

  it('should init response even with empty ctor values', function () {
    const r1 = new Response(null)
    const r3 = new Response(Readable.from(txt(), { objectMode: false }))

    expect(r1.body).toBeNull()
    expect(r1.bodyUsed).toBeFalsy()
    expect(r1.status).toEqual(200)

    expect(r3.body).toBeInstanceOf(Readable)
    expect(r3.bodyUsed).toBeFalsy()
    expect(r3.status).toEqual(200)
  })

  it('should init with default values when Init is null', () => {
    const response = new Response(null)

    expect(response.body).toBeNull()
    expect(response.bodyUsed).toBeFalsy()
    expect(response.status).toEqual(200)
    expect(response.statusText).toEqual('')
    expect(response.redirected).toBeFalsy()
    expect(response.url).toEqual('')
    expect(response.type).toEqual('basic')
    expect(response.ok).toBeTruthy()
    expect(response.headers.size).toEqual(0)
  })

  it('should init with provided values', () => {
    const status = 404
    const statusText = 'Not Found'
    const headers = new Headers({ 'content-type': 'application/json', 'x-id': '100' })
    const type = 'type'
    const url = 'http://www.test.com/path'

    const response = new Response(Readable.from(txt(), { objectMode: false }),
      {
        status,
        statusText,
        headers,
        type,
        url
      })

    expect(response.status).toEqual(status)
    expect(response.statusText).toEqual(statusText)
    expect(response.redirected).toBeFalsy()
    expect(response.url).toEqual(url)
    expect(response.type).toEqual(type)
    expect(response.ok).toBeFalsy()
    expect(response.headers).toStrictEqual(headers)

    const clone = response.clone()

    expect(clone).toStrictEqual(response)
  })

  it('should throw error when redirect with a invalid status code', () => {
    const url = 'http://www.test.com.br'
    expect(() => Response.redirect(url, 200)).toThrowError()
    expect(() => Response.redirect(url, 400)).toThrowError()
    expect(() => Response.redirect(url, 500)).toThrowError()
  })

  it('should redirect when status is within the valid range', () => {
    const url = 'http://www.test.com.br/'
    const res301 = Response.redirect(url, 301)

    expect(res301.status).toEqual(301)
    expect(res301.headers.get('location')).toEqual(url)
    expect(res301.body).toBeNull()

    const res303 = Response.redirect(url, 303)

    expect(res303.status).toEqual(303)
    expect(res303.headers.get('location')).toEqual(url)
    expect(res303.body).toBeNull()

    const res307 = Response.redirect(url, 307)

    expect(res307.status).toEqual(307)
    expect(res307.headers.get('location')).toEqual(url)
    expect(res307.body).toBeNull()

    const res308 = Response.redirect(url, 308)

    expect(res308.status).toEqual(308)
    expect(res308.headers.get('location')).toEqual(url)
    expect(res308.body).toBeNull()
  })

  it('should return Response marked as error handledType when calling error()', () => {
    expect(Response.error().type).toEqual('error')
  })
})
