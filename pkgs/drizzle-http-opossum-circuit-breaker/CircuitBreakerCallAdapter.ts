import { CallAdapter } from '@drizzle-http/core'
import { Call } from '@drizzle-http/core'
import CircuitBreaker from 'opossum'
import { Registry } from './Registry'
import { LifeCycleListener } from './LifeCycleListener'

interface CircuitBreakerInit {
  name: string
  options: CircuitBreaker.Options
  registry: Registry
  fallback?: (...args: unknown[]) => unknown
  listener?: LifeCycleListener
}

export class CircuitBreakerCallAdapter implements CallAdapter<unknown, unknown> {
  private readonly name: string
  private readonly options: CircuitBreaker.Options
  private readonly registry: Registry
  private readonly fallback?: (...args: unknown[]) => unknown
  private readonly listener?: LifeCycleListener

  private circuitBreaker: CircuitBreaker | null = null

  constructor(init: CircuitBreakerInit) {
    this.name = init.name
    this.options = init.options
    this.registry = init.registry
    this.fallback = init.fallback
    this.listener = init.listener
  }

  adapt(action: Call<unknown>): Promise<unknown> {
    if (this.circuitBreaker === null) {
      this.circuitBreaker = new CircuitBreaker<unknown[], unknown>(() => action.execute(), { ...this.options })

      if (this.fallback) {
        this.circuitBreaker.fallback(this.fallback)
      }

      this.registry.register(this.circuitBreaker)
      this.listener?.onRegistered(this.circuitBreaker)
    }

    this.listener?.onBeforeExecution(this.circuitBreaker)

    return this.circuitBreaker.fire(...action.argv)
  }
}
