import { CallAdapter } from '@drizzle-http/core'
import { Call } from '@drizzle-http/core'
import { HttpRequest } from '@drizzle-http/core'
import CircuitBreaker from 'opossum'
import { Registry } from './Registry'

interface CircuitBreakerInit {
  options: CircuitBreaker.Options
  registry: Registry
  fallback?: (...args: unknown[]) => unknown
}

export class CircuitBreakerCallAdapter implements CallAdapter<unknown, unknown> {
  private readonly options: CircuitBreaker.Options
  private readonly registry: Registry
  private readonly fallback?: (...args: unknown[]) => unknown

  constructor(init: CircuitBreakerInit) {
    this.options = init.options
    this.registry = init.registry
    this.fallback = init.fallback
  }

  adapt(action: Call<unknown>): (request: HttpRequest, argv: unknown[]) => Promise<unknown> {
    const circuitBreaker = new CircuitBreaker<[HttpRequest, unknown[]], unknown>(
      (request, argv) => action.execute(request, argv),
      { ...this.options }
    )

    if (this.fallback) {
      circuitBreaker.fallback((...[_, argv, error]) => this.fallback?.(...argv, error))
    }

    this.registry.register(circuitBreaker)

    return (request, argv) => circuitBreaker.fire(request, argv)
  }
}
