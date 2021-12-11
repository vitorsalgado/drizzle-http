import CircuitBreaker from 'opossum'
import { Registry } from './Registry'

export class CircuitBreakerRegistry implements Registry {
  private readonly _entries: Map<string, CircuitBreaker> = new Map<string, CircuitBreaker>()

  register(circuitBreaker: CircuitBreaker): void {
    this._entries.set(circuitBreaker.name, circuitBreaker)
  }

  find(name: string): CircuitBreaker | null {
    return this._entries.get(name) ?? null
  }

  list(): CircuitBreaker[] {
    return Array.from(this._entries.values())
  }

  [Symbol.iterator](): IterableIterator<[string, CircuitBreaker]> {
    return this._entries.entries()
  }
}
