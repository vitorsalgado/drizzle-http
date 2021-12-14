import { devices, PlaywrightTestConfig } from '@playwright/test'

const isCI = (process.env.CI as string) === 'true'
const port = process.env.PORT || '3000'

const PlaywrightConfig: PlaywrightTestConfig = {
  forbidOnly: !isCI,
  retries: isCI ? 2 : 0,
  testDir: '__tests__/',
  webServer: {
    command: `npm run webpack:server-dev`,
    port: parseInt(port),
    timeout: 30000,
    reuseExistingServer: !isCI
  },
  use: {
    trace: 'on-first-retry',
    headless: true
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
}

export default PlaywrightConfig
