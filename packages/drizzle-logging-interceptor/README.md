# Logging Interceptor &middot; [![ci](https://github.com/vitorsalgado/drizzle-http/workflows/ci/badge.svg)](https://github.com/vitorsalgado/drizzle-http/actions) [![npm (scoped)](https://img.shields.io/npm/v/@drizzle-http/logging-interceptor)](https://www.npmjs.com/package/@drizzle-http/logging-interceptor) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/vitorsalgado/drizzle-http/blob/main/LICENSE)

[Drizzle-Http](https://github.com/vitorsalgado/drizzle-http) interceptor that logs HTTP requests and responses.  
The default Logger implementation uses [Pino](https://getpino.io/).

## Installation

Make sure we have the core module [@Drizzle-Http/core](https://www.npmjs.com/package/@drizzle-http/core) installed.

```
npm i @drizzle-http/core
npm i @drizzle-http/logging-interceptor
```

## Node

### Basic

```typescript
import { LoggingInterceptor } from '@drizzle-http/logging-interceptor'
import { DrizzleBuilder } from "@drizzle-http/core";
import { UndiciCallFactory } from "@drizzle-http/undici";

const interceptor = new LoggingInterceptor()

const api = DrizzleBuilder
  .newBuilder()
  .baseUrl(address)
  .callFactory(new UndiciCallFactory())
  .addInterceptor(interceptor)
  .build()
  .create(API)
```

### Customize

```typescript
import { LoggingInterceptor } from '@drizzle-http/logging-interceptor'
import { Level } from "@drizzle-http/logging-interceptor";
import { DrizzleBuilder } from "@drizzle-http/core";
import { UndiciCallFactory } from "@drizzle-http/undici";

const interceptor = new LoggingInterceptor({ level: Level.Body, logger: customLogger })
interceptor.redactHeader('x-super-secret-header')
interceptor.redactHeaders(['x-other-secret-header', 'x-one-more-secret-header'])

const api = DrizzleBuilder
  .newBuilder()
  .baseUrl(address)
  .callFactory(new UndiciCallFactory())
  .addInterceptor(interceptor)
  .build()
  .create(API)
```

## Browser

### Basic

```typescript
import { BrowserLoggingInterceptor } from '@drizzle-http/logging-interceptor'

const api = DrizzleBuilder
  .newBuilder()
  .baseUrl(address)
  .callFactory(new UndiciCallFactory())
  .addInterceptor(new BrowserLoggingInterceptor())
  .build()
  .create(API)
```

> It's not possible to change the logger implementation from BrowserLoggingInterceptor. It will use console.log.
