import CircuitBreaker from 'opossum'

export interface LifeCycleListener {
  onRegistered(circuitBreaker: CircuitBreaker): void

  onBeforeExecution(circuitBreaker: CircuitBreaker): void
}
