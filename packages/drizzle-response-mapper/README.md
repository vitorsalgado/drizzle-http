# Response Mapper Adapter &middot; [![ci](https://github.com/vitorsalgado/drizzle-http/workflows/ci/badge.svg)](https://github.com/vitorsalgado/drizzle-http/actions) [![npm (scoped)](https://img.shields.io/npm/v/@drizzle-http/opossum-circuit-breaker)](https://www.npmjs.com/package/@drizzle-http/opossum-circuit-breaker) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/vitorsalgado/drizzle-http/blob/main/LICENSE)

Map API responses to a different type. Good for situations where the api responds with envelope like payloads or the
payload comes in a complex format.

## Installation

Make sure we have the core module [@Drizzle-Http/core](https://www.npmjs.com/package/@drizzle-http/core) installed.

```
npm i @drizzle-http/core
npm i @drizzle-http/response-mapper-adapter
```

## Usage

```typescript
import { GET } from '@drizzle-http/core'
import { Param } from '@drizzle-http/core'
import { Map } from '@drizzle-http/response-mapper-adapter'
import { MapTo } from '@drizzle-http/response-mapper-adapter'

class Project {
  private readonly id: string
  private readonly description: string

  constructor(response) {
    this.id = response.data.id
    this.description = response.data.description
  }
}

class API {
  @GET('/customers/{id}')
  @Map((response: { data: Customer }) => response.data)
  customerById(@Param('id') id: string): Promise<Customer> { }

  @GET('/projects/{id}')
  @MapTo(Project)
  projectById(@Param('id') id: string): Promise<Project> { }
}
```

## Features

### Map Function

Use the decorator `@Map()` and pass a function to map the response to another type.

### Map To Class Instance

Use the decorator `@MapTo()` and pass a class reference to map to new instance of the same.  
If you pass only the first argument, the class constructor will be used. On the second argument, you can provide a
custom factory method, for example, a static method on the class.
