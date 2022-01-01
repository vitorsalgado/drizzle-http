# Opossum Circuit Breaker Adapter &middot; [![ci](https://github.com/vitorsalgado/drizzle-http/workflows/ci/badge.svg)](https://github.com/vitorsalgado/drizzle-http/actions) [![npm (scoped)](https://img.shields.io/npm/v/@drizzle-http/opossum-circuit-breaker)](https://www.npmjs.com/package/@drizzle-http/opossum-circuit-breaker) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/vitorsalgado/drizzle-http/blob/main/LICENSE)

Circuit breaker adapter with [Opossum](https://github.com/nodeshift/opossum).

## Installation

Make sure we have the core module [@Drizzle-Http/core](https://www.npmjs.com/package/@drizzle-http/core) installed.

```
npm i @drizzle-http/core
npm i @drizzle-http/opossum-circuit-breaker
```

## Usage

Usage typically looks like the example below:

```typescript
import { CircuitBreakerCallAdapterFactory } from "@drizzle-http/opossum-circuit-breaker";
import { DrizzleBuilder } from "@drizzle-http/core";
import { UndiciCallFactory } from "@drizzle-http/undici";
import { CircuitBreaker } from "@drizzle-http/opossum-circuit-breaker";
import { Fallback } from "@drizzle-http/opossum-circuit-breaker";
import { GET } from "@drizzle-http/core";

class CustomerApi {
  @GET('/customers')
  @CircuitBreaker({ /* Opossum CircuitBreaker.Options */ })
  @Fallback('customersAlt')
  customers(): Promise<Customer[]> { }
}

class CustomerApiFallbacks {
  customersAlt(id: string, error: Error): Promise<Customer> {
    // Fallback implementation
  }
}

const factory = new CircuitBreakerCallAdapterFactory({ options: { /* global options */ }, fallbacks: new CustomerApiFallbacks() })
const api = DrizzleBuilder
  .newBuilder()
  .baseUrl(/* base url */)
  .callFactory(new UndiciCallFactory())
  .addCallAdapterFactories(factory)
  .build()
  .create(CustomerApi)
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
