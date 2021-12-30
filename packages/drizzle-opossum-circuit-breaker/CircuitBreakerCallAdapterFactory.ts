import { CallAdapterFactory } from '@drizzle-http/core'
import { Drizzle } from '@drizzle-http/core'
import { CallAdapter } from '@drizzle-http/core'
import { RequestFactory } from '@drizzle-http/core'
import OpoCircuitBreaker from 'opossum'
import { Keys } from './Keys'
import { Registry } from './Registry'
import { CircuitBreakerRegistry } from './CircuitBreakerRegistry'
import { CircuitBreakerCallAdapter } from './CircuitBreakerCallAdapter'
import { CircuitBreaker } from './decorators'

interface Init {
  options?: OpoCircuitBreaker.Options
  registry?: Registry
  fallbacks?: object | Record<string, (...args: unknown[]) => unknown>
}

export class CircuitBreakerCallAdapterFactory implements CallAdapterFactory {
  private readonly options: OpoCircuitBreaker.Options
  private readonly registry: Registry
  private readonly fallbacks?: object | Record<string, (...args: unknown[]) => unknown>

  constructor(init: Init = {}, private readonly decorated?: CallAdapterFactory) {
    this.options = init.options ?? {}
    this.registry = init.registry ?? new CircuitBreakerRegistry()
    this.fallbacks = init.fallbacks
  }

  circuitBreakerRegistry(): Registry {
    return this.registry
  }

  provide(drizzle: Drizzle, requestFactory: RequestFactory): CallAdapter<unknown, unknown> | null {
    if (!requestFactory.hasDecorator(CircuitBreaker)) {
      return null
    }

    const decorated = this.decorated
      ? (this.decorated.provide(drizzle, requestFactory) as CallAdapter<unknown, Promise<unknown>>)
      : null
    const method = requestFactory.method
    const decoratorOptions = requestFactory.getConfig<OpoCircuitBreaker.Options>(Keys.OptionsForMethod)
    const name = `${this.options.name ? this.options.name : ''}${decoratorOptions.name}`
    const group = `${this.options.group ? this.options.name : ''}${
      decoratorOptions.group ? decoratorOptions.group : ''
    }`
    const options = {
      ...this.options,
      ...decoratorOptions,
      name,
      group
    }

    if (this.registry.find(name)) {
      throw new Error(`The name "${name}" is already used by another circuit breaker in the internal registry.`)
    }

    const methodFallback = requestFactory.getConfig(Keys.FallbackMethod) as string | ((...args: unknown[]) => unknown)
    const _fallbacks = this.fallbacks as Record<string, (...args: unknown[]) => unknown> | null

    let fallback: ((...args: unknown[]) => unknown) | undefined

    if (methodFallback) {
      if (typeof methodFallback === 'string') {
        if (!_fallbacks) {
          throw new Error(
            `Method ${method} specify a fallback method but no fallback class was provided.` +
              `Provide fallback instance in CircuitBreakerCallAdapterFactory constructor with a method name matching "${method}" and same argument list.`
          )
        }

        if (!(typeof _fallbacks[methodFallback] === 'function')) {
          throw new Error(
            `The fallback class "${_fallbacks.constructor.name}" doesn't provide a method "${methodFallback}"`
          )
        }

        fallback = (...args: unknown[]) => _fallbacks[methodFallback](...args)
      } else {
        fallback = methodFallback
      }
    } else {
      if (_fallbacks) {
        if (typeof _fallbacks[method] === 'function') {
          fallback = (...args: unknown[]) => _fallbacks[method](...args)
        }
      }
    }

    return new CircuitBreakerCallAdapter(
      {
        options,
        fallback,
        registry: this.registry
      },
      decorated
    )
  }
}
