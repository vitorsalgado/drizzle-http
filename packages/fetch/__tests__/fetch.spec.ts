import { expect, test } from '@playwright/test'
import { startServer } from './server'
import { closeServer } from './server'

const devUrl = 'http://localhost:3000'

test.describe('Fetch Client', () => {
  test.beforeEach(({ page }) => page.goto(devUrl))
  test.beforeAll(() => startServer())
  test.afterAll(() => closeServer())

  test('check GET and POST requests with default fetch response and parsed json body', async ({ page }) => {
    await expect(page.locator('#txt')).toHaveText('success')

    const json = await page.innerText('#json')
    const response = JSON.parse(json)

    expect(response).toEqual({
      status: 'ok',
      data: {
        test: 'json'
      }
    })
  })
})
