# RxJs Call Adapter &middot; [![ci](https://github.com/vitorsalgado/drizzle-http/workflows/ci/badge.svg)](https://github.com/vitorsalgado/drizzle-http/actions) [![npm (scoped)](https://img.shields.io/npm/v/@drizzle-http/rxjs-adapter)](https://www.npmjs.com/package/@drizzle-http/rxjs-adapter) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/vitorsalgado/drizzle-http/blob/main/LICENSE)

[RxJs](https://rxjs-dev.firebaseapp.com/) call adapter implementation for Drizzle-HTTP.

## Installation

Make sure we have the core module [@Drizzle-Http/core](https://www.npmjs.com/package/@drizzle-http/core) installed.

```
npm i @drizzle-http/core
npm i @drizzle-http/rxjs-adapter
```

## Usage

After adding the `RxJsCallAdapterFactory` to Drizzle instance, decorate your class or methods with `@RxJs()`.  
See the example below.

```typescript
import { GET } from "@drizzle-http/core";
import { Param } from "@drizzle-http/core";
import { RxJs } from "@drizzle-http/rxjs-adapter";
import { DrizzleBuilder } from "@drizzle-http/core";
import { RxJsCallAdapterFactory } from "@drizzle-http/rxjs-adapter";

@RxJs()
class API {
  @GET('/{id}/projects')
  projects(@Param('id') id: string): Observable<Project[]> { }
}

const api = DrizzleBuilder
  .newBuilder()
  .baseUrl(addr)
  .addCallAdapterFactories(new RxJsCallAdapterFactory(/* optional: you can pass another adapter factory */))
  .build()
  .create(API)
```
