import * as StaticServer from './test/server_static'
import * as RestServer from './test/server'
import Puppeteer from 'puppeteer'

describe('Fetch Client', () => {
  let browser: any = null

  beforeAll(async () => {
    browser = await Puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
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
