import * as StaticServer from './test/server_static'
import * as RestServer from './test/server'
import Puppeteer from 'puppeteer'
import {
  Cache,
  Compress,
  CORS,
  Credentials,
  FetchCallFactory,
  Follow,
  HighWaterMark,
  Integrity,
  KeepAlive,
  Mode,
  Navigate,
  NoCORS,
  Redirect,
  Referrer,
  ReferrerPolicy,
  SameOrigin,
  Size
} from './'
import {
  Body,
  ContentType,
  Drizzle,
  DrizzleBuilder,
  GET,
  HttpError,
  MediaTypes,
  POST,
  Response,
  theTypes
} from '@drizzle-http/core'
import { closeTestServer, startTestServer, TestResult } from '@drizzle-http/test-utils'
import http from 'http'

const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 1
})

class Api {
  @GET('/')
  @ContentType('application/json;charset=utf-8')
  @CORS()
  @KeepAlive(true)
  test(): Promise<Response> {
    return theTypes(Promise, Response)
  }

  @GET('/nowhere')
  @ContentType('application/json;charset=utf-8')
  @CORS()
  @KeepAlive(true)
  err404(): Promise<Response> {
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
  @Compress(true)
  @Follow(10)
  @HighWaterMark(1024)
  @Size(15)
  all(@Body() data: any): Promise<TestResult<any>> {
    return theTypes(Promise)
  }
}

describe('Fetch Client (Node.js)', function () {
  let address: string
  let drizzle: Drizzle
  let api: Api

  beforeAll(() =>
    startTestServer().then((addr: string) => {
      address = addr
      drizzle = DrizzleBuilder.newBuilder()
        .baseUrl(address)
        .callFactory(new FetchCallFactory({ agent: httpAgent }))
        .build()
      api = drizzle.create(Api)
    })
  )

  afterAll(async () => {
    await closeTestServer()
    await drizzle.shutdown()
  })

  it('should perform request with patched global fetch', function () {
    expect.assertions(2)

    return api.test().then(response => {
      expect(response.status).toEqual(200)
      expect(response.ok).toBeTruthy()
    })
  })

  it('should return error on .catch() instead of on .then()', function () {
    expect.assertions(3)

    return api.err404().catch(err => {
      expect(err).toBeInstanceOf(HttpError)
      expect(err.response.status).toEqual(404)
      expect(err.response.ok).toBeFalsy()
    })
  })

  it('should POST and read JSON data', function () {
    expect.assertions(2)

    return api.all({ test: 'hi' }).then(response => {
      expect(response.body.test).toEqual('hi')
      expect(response.result.ok).toBeTruthy()
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
