/* eslint-disable @typescript-eslint/ban-ts-comment */

import { GET, HttpHeaders, newAPI, noop, PlainTextResponse, RawResponse } from '@drizzle-http/core'
import { CORS, KeepAlive } from '../decorators'
import { useFetch } from '../useFetch'

@KeepAlive(true)
@CORS()
class TestAPI {
  @GET('/txt')
  @PlainTextResponse()
  @RawResponse()
  txt(): Promise<Response> {
    return noop()
  }
}

const url = 'https://example.com'
const api = newAPI().baseUrl(url).configurer(useFetch()).build().create(TestAPI)

const makeUrl = (url: string, path: string) => url + path

describe('Fetch', function () {
  beforeEach(() => {
    // @ts-ignore
    global.Headers = HttpHeaders
  })

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch.mockClear()
  })

  describe('when using decorators on class level', function () {
    // @ts-ignore
    global.fetch = jest.fn(() =>
      Promise.resolve({
        headers: new HttpHeaders(),
        text: () => Promise.resolve('txt')
      })
    )

    it('should execute request using class decorators values', async function () {
      const response = await api.txt()
      const txt = await response.text()
      const args = (global.fetch as jest.Mock).mock.calls[0]

      expect(txt).toEqual('txt')
      expect(args[0]).toEqual(makeUrl(url, '/txt'))
      expect(args[1]).toHaveProperty('mode', 'cors')
      expect(args[1]).toHaveProperty('keepalive', true)
    })
  })
})
