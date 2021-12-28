# Opossum Circuit Breaker Adapter &middot; [![ci](https://github.com/vitorsalgado/drizzle-http/workflows/ci/badge.svg)](https://github.com/vitorsalgado/drizzle-http/actions) [![npm (scoped)](https://img.shields.io/npm/v/@drizzle-http/opossum-circuit-breaker)](https://www.npmjs.com/package/@drizzle-http/opossum-circuit-breaker) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/vitorsalgado/drizzle-http/blob/main/LICENSE)

Circuit breaker adapter with [Opossum](https://github.com/nodeshift/opossum).

## Installation

### NPM

```
npm i @drizzle-http/opossum-circuit-breaker
```

### Yarn

```
yarn add @drizzle-http/opossum-circuit-breaker
```

## Usage

Usage typically looks like the example below:

```typescript
class CustomerApi {
  @GET('/customers/{id}')
  @UseCircuitBreaker({ /* Opossum CircuitBreaker.Options */ })
  @Fallback('customersAlt')
  customers(@Param('id') id: string): Promise<Customer[]> {
    return noop(id, filter, test)
  }
}

class CustomerApiFallbacks {
  customersAlt(id: string, error: Error): Promise<Customer> {
    // Fallback implementation
  }
}

const factory = new CircuitBreakerCallAdapterFactory({
  options: { /* global options */ },
  fallbacks: new CustomerApiFallbacks()
})
const api = DrizzleBuilder.newBuilder()
  .baseUrl(/* base url */)
  .callFactory(new UndiciCallFactory() /* any call factory */)
  .addCallAdapterFactories(factory)
  .build()
  .create(CustomerApi)

api.customers('100').then(customers => console.log(customers))
```

## Features

All functionalities from [Opossum](https://github.com/nodeshift/opossum) are available.  
Some features and extensions:

### Fallback

Fallback methods follow Opossum specification, same argument list and an error argument at the end.  
There are 3 ways to specify a fallback for a circuit breaker:

- Specify a fallback class in `CircuitBreakerCallAdapterFactory` constructor. If a method name matches the one specified
  in the API class, it will be used as a fallback automatically.
- Apply the decorator `@Fallback()` and:
  * If `@Fallback()` decorator argument is a string, it will try to find the method on the fallback class specified in
    the `CircuitBreakerCallAdapterFactory` constructor.
  * If `@Fallback` decorator receives a function, this function will be the fallback.

> Make sure the fallback methods have right signature: same argument list + error at the end and same return type.

### Registry

All circuit breakers associated with a CircuitBreakerCallAdapterFactory are stored in a registry instance.
`CircuitBreakerCallAdapterFactory` accepts a parameter `registry`. You can pass a custom `Registry` implementation.

> The circuit breaker instance is only stored in the registry after the first execution. If you want to change the circuit breaker behaviour, prefer to use a LifeCycleListener implementation.

### LifeCycle Listener

**LifeCycle Listener** allows listening to some events in the circuit breaker life cycle.  
Pass your `LifeCycleListener` implementation to the `CircuitBreakerCallAdapterFactory` constructor `lifecycle` parameter
following the contract:

```
interface LifeCycleListener {
  onRegistered(circuitBreaker: CircuitBreaker): void

  onBeforeExecution(circuitBreaker: CircuitBreaker): void
}
```
