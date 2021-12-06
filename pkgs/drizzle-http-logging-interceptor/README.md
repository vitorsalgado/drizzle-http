# Logging Interceptor &middot; [![ci](https://github.com/vitorsalgado/drizzle-http/workflows/ci/badge.svg)](https://github.com/vitorsalgado/drizzle-http/actions) [![npm (scoped)](https://img.shields.io/npm/v/@drizzle-http/logging-interceptor)](https://www.npmjs.com/package/@drizzle-http/logging-interceptor) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/vitorsalgado/drizzle-http/blob/main/LICENSE)

[Drizzle-Http](https://github.com/vitorsalgado/drizzle-http) interceptor that logs HTTP requests and responses.  
The default Logger implementation uses [Pino](https://getpino.io/).

## Installation

The main package, [Drizzle-Http](https://www.npmjs.com/package/drizzle-http), already contains this module.  
If you are installing each package individually, make sure to install
first [@Drizzle-Http/core](https://www.npmjs.com/package/@drizzle-http/core) with: `npm i @drizzle-http/core`

### NPM

```
npm i @drizzle-http/logging-interceptor
```

### Yarn

```
yarn add @drizzle-http/logging-interceptor
```

## Node

### Basic

```typescript
import { LoggingInterceptor } from '@drizzle-http/logging-interceptor'

const interceptor = new LoggingInterceptor()

const api = Drizzle.builder()
  .baseUrl(address)
  .callFactory(new UndiciCallFactory())
  .addInterceptor(interceptor)
  .build()
  .create(API)
```

### Customize

```typescript
import { LoggingInterceptor } from '@drizzle-http/logging-interceptor'

const interceptor = new LoggingInterceptor(fake, Level.BODY)
interceptor.redactHeader('x-super-secret-header')
interceptor.redactHeaders(['x-other-secret-header', 'x-one-more-secret-header'])

const api = DrizzleBuilder.newBuilder()
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

const api = DrizzleBuilder.newBuilder()
  .baseUrl(address)
  .callFactory(new UndiciCallFactory())
  .addInterceptor(new BrowserLoggingInterceptor())
  .build()
  .create(API)
```

> It's not possible to change the logger implementation from BrowserLoggingInterceptor. It will use console.log.

## Features

You can change the level using the following values: `NONE, BASIC, HEADERS, BODY`.  
To customize the default Pino implementation, provide a custom instance of **PinoLogger**. E.g.:

```typescript
import { Level } from '@drizzle-http/logging-interceptor'
import { LoggingInterceptor } from '@drizzle-http/logging-interceptor'

const customPinoLogger = new PinoLogger({ /* pino.LoggerOptions */ })

const api = DrizzleBuilder.newBuilder()
  .baseUrl(address)
  .callFactory(new UndiciCallFactory())
  .addInterceptor(new LoggingInterceptor(Level.BODY, new Set(), customPinoLogger))
  .build()
  .create(API)
```

To avoid logging sensitive information on Headers, use:

```typescript
loggingInterceptor.redactHeader('secret-header')
```
