import * as StaticServer from './test/server_static'
import * as RestServer from './test/server'
import Puppeteer from 'puppeteer'
import {
  Cache,
  CORS,
  Credentials,
  FetchCallFactory,
  Integrity,
  KeepAlive,
  Mode,
  Navigate,
  NoCORS,
  Redirect,
  Referrer,
  ReferrerPolicy,
  SameOrigin
} from './'
import { ContentType, DrizzleBuilder, GET, MediaTypes, POST, Response, theTypes } from '@drizzle-http/core'
import NodeFetch from 'node-fetch'
import { closeTestServer, startTestServer } from '@drizzle-http/test-utils'

class Api {
  @GET('/')
  @ContentType('application/json;charset=utf-8')
  @CORS()
  @KeepAlive(true)
  test(): Promise<Response> {
    return theTypes(Promise, Response)
  }

  @POST('/')
  @ContentType(MediaTypes.APPLICATION_JSON_UTF8)
  @Mode('cors')
  @NoCORS()
  @SameOrigin()
  @Integrity('hash')
  @ReferrerPolicy('same-origin')
  @Referrer('ref')
  @Redirect('manual')
  @Credentials('include')
  @Cache('force-cache')
  @Navigate()
  all(): Promise<Response> {
    return theTypes(Promise, Response)
  }
}

describe('Fetch Client (Node-Fetch)', function () {
  let address: string

  beforeAll(() =>
    startTestServer().then((addr: string) => {
      address = addr
    })
  )

  afterAll(() => closeTestServer())

  it('should perform request with patched global fetch', function () {
    expect.assertions(3)

    if (!globalThis.fetch) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      globalThis.fetch = NodeFetch
    }

    const drizzle = DrizzleBuilder.newBuilder().baseUrl(address).callFactory(FetchCallFactory.DEFAULT).build()

    const api: Api = drizzle.create(Api)

    expect(api).not.toBeNull()

    return api
      .test()
      .then(response => {
        expect(response.status).toEqual(200)
        expect(response.ok).toBeTruthy()
      })
      .finally(() => {
        return drizzle.shutdown()
      })
  })
})

describe('Fetch Client', () => {
  let browser: any = null

  beforeAll(async () => {
    browser = await Puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
    })

    StaticServer.start()
    RestServer.start()
  })

  afterAll(async () => {
    await browser.close()

    StaticServer.close()
    RestServer.close()
  })

  it('should work with transpiled Typescript', async () => {
    const page = await browser.newPage()
    await page.goto('http://localhost:3002/ts.html')

    await page.waitForTimeout(2500)

    const div = await page.$('#test')
    const txt = await div?.getProperty('innerText')
    const val = await txt.jsonValue()

    expect(val).toEqual('success')
  }, 10000)

  it('should work with transpiled Javascript', async () => {
    const page = await browser.newPage()
    await page.goto('http://localhost:3002/ts.html')

    await page.waitForTimeout(2500)

    const div = await page.$('#test')
    const txt = await div?.getProperty('innerText')
    const val = await txt.jsonValue()

    expect(val).toEqual('success')
  }, 10000)
})
