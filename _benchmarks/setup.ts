import http from 'http'
import { Pool } from 'undici'
import { DrizzleBuilder } from '@drizzle-http/core'
import { UndiciCallFactory } from '@drizzle-http/undici'
import { CircuitBreakerCallAdapterFactory } from '@drizzle-http/opossum-circuit-breaker'
import { TestAPI } from './test_api.js'
import { connections, pipelining } from './config.js'

export type BenchTarget = {
  port: string
  url: string
}

export const benchPath = `/10002000?filter=${encodeURIComponent('some filter parameter')}`
export const jsonHeaders = { 'Content-Type': 'application/json' } as const

export const benchBody = {
  id: 100,
  name: 'bench',
  context: 'benchmark-test',
  active: true
} as const

export function resolveTarget(): BenchTarget {
  const port = process.env.PORT ?? '3000'
  return {
    port,
    url: `http://localhost:${port}/`
  }
}

export function benchUrl(target: BenchTarget): string {
  return new URL(benchPath, target.url).href
}

export function createBenchContext(target: BenchTarget) {
  const poolOptions = { pipelining, connections, ...target }
  const httpAgent = new http.Agent({ keepAlive: true, maxSockets: connections })

  const drizzle = DrizzleBuilder.newBuilder()
    .baseUrl(target.url)
    .callFactory(new UndiciCallFactory(poolOptions))
    .addCallAdapterFactories(
      new CircuitBreakerCallAdapterFactory({
        options: {
          timeout: false,
          cache: false
        }
      })
    )
    .build()

  return {
    httpAgent,
    api: drizzle.create(TestAPI),
    pool: new Pool(target.url, poolOptions)
  }
}
