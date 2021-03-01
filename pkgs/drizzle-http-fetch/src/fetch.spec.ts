import * as StaticServer from './test/server_static'
import * as RestServer from './test/server'
import Puppeteer from 'puppeteer'
import { CORS, FetchCallFactory, KeepAlive } from './'
import { ContentType, DrizzleBuilder, GET, Response, theTypes } from '@drizzle-http/core'

class Api {
  @GET('/')
  @ContentType('application/json;charset=utf-8')
  @CORS()
  @KeepAlive(true)
  test(): Promise<Response> {
    return theTypes(Promise, Response)
  }
}

describe('Fetch Client Init', function () {
  it('should load correctly', () => {
    const api = DrizzleBuilder.newBuilder()
      .baseUrl('http://localhost:3001/')
      .callFactory(FetchCallFactory.DEFAULT)
      .build()
      .create(Api)

    expect(api).not.toBeNull()
  })
})

describe.skip('Fetch Client', () => {
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

  it.skip('should work with transpiled Typescript', async () => {
    const page = await browser.newPage()
    await page.goto('http://localhost:3002/ts.html')

    await page.waitForTimeout(2500)

    const div = await page.$('#test')
    const txt = await div?.getProperty('innerText')
    const val = await txt.jsonValue()

    expect(val).toEqual('success')
  }, 10000)

  it.skip('should work with transpiled Javascript', async () => {
    const page = await browser.newPage()
    await page.goto('http://localhost:3002/ts.html')

    await page.waitForTimeout(2500)

    const div = await page.$('#test')
    const txt = await div?.getProperty('innerText')
    const val = await txt.jsonValue()

    expect(val).toEqual('success')
  }, 10000)
})
