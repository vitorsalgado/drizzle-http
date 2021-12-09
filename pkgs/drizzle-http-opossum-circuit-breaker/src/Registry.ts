import CircuitBreaker from 'opossum'

export interface Registry {
  register(entry: CircuitBreaker): void

  find(name: string): CircuitBreaker | null

  list(): CircuitBreaker[]

  [Symbol.iterator](): IterableIterator<[string, CircuitBreaker]>
}
