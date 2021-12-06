import EventEmitter from 'events'
import Puppeteer from 'puppeteer'
import { Browser } from 'puppeteer'
import { Abort, Body, ContentType, GET, MediaTypes, noop, POST, Timeout } from '@drizzle-http/core'
import { FullResponse } from '@drizzle-http/core'
import { TestResult } from '@drizzle-http/test-utils'
import {
  Cache,
  CORS,
  Credentials,
  Integrity,
  Mode,
  Navigate,
  NoCORS,
  Redirect,
  Referrer,
  ReferrerPolicy,
  SameOrigin
} from '..'
import { KeepAlive } from '../decorators'
import * as RestServer from './test/server'
import * as StaticServer from './test/server_static'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Api {
  @GET('/')
  @ContentType('application/json;charset=utf-8')
  @CORS()
  @KeepAlive(true)
  @Timeout(5000)
  @FullResponse()
  test(): Promise<Response> {
    return noop()
  }

  @GET('/nowhere')
  @ContentType('application/json;charset=utf-8')
  @CORS()
  @KeepAlive(true)
  @FullResponse()
  err404(): Promise<Response> {
    return noop()
  }

  @GET('/long-running')
  @ContentType('application/json;charset=utf-8')
  @CORS()
  @KeepAlive(true)
  @Timeout(1500)
  @FullResponse()
  slow(@Abort() abort: EventEmitter | AbortSignal): Promise<Response> {
    return noop(Promise, Response, abort)
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
  all(@Body() data: unknown): Promise<TestResult<unknown>> {
    return noop(data)
  }
}

describe('Fetch Client', () => {
  let browser!: Browser

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
    const val = await txt?.jsonValue()

    expect(val).toEqual('success')
  }, 10000)

  it('should work with transpiled Javascript', async () => {
    const page = await browser.newPage()
    await page.goto('http://localhost:3002/ts.html')

    await page.waitForTimeout(2500)

    const div = await page.$('#test')
    const txt = await div?.getProperty('innerText')
    const val = await txt?.jsonValue()

    expect(val).toEqual('success')
  }, 10000)
})
