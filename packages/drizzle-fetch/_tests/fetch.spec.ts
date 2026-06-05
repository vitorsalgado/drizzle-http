/* eslint-disable @typescript-eslint/ban-ts-comment */

import { vi, type Mock } from 'vitest'
import { GET, newAPI, noop, PlainTextResponse, RawResponse } from '@drizzle-http/core'
import { CORS, KeepAlive } from '../decorators/index.js'
import { useFetch } from '../useFetch.js'

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
  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch.mockClear()
  })

  describe('when using decorators on class level', function () {
    // @ts-ignore
    global.fetch = vi.fn(() =>
      Promise.resolve({
        headers: new Headers(),
        text: () => Promise.resolve('txt')
      })
    )

    it('should execute request using class decorators values', async function () {
      const response = await api.txt()
      const txt = await response.text()
      const args = (global.fetch as Mock).mock.calls[0]

      expect(txt).toEqual('txt')
      expect(args[0]).toEqual(makeUrl(url, '/txt'))
      expect(args[1]).toHaveProperty('mode', 'cors')
      expect(args[1]).toHaveProperty('keepalive', true)
    })
  })
})
