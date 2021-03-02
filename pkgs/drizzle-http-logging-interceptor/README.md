# Logging Interceptor &middot; ![ci](https://github.com/vitorsalgado/drizzle-http/workflows/ci/badge.svg) ![npm (scoped)](https://img.shields.io/npm/v/@drizzle-http/logging-interceptor) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/vitorsalgado/drizzle-http/blob/main/LICENSE)

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

## Usage

### Default Implementation

```typescript
const api = Drizzle.builder()
  .baseUrl(address)
  .callFactory(UndiciCallFactory.DEFAULT)
  .addInterceptor(interceptor)
  .build()
  .create(API)
```

### Customize

```typescript
const interceptor = new LoggingInterceptor(fake, Level.BODY)
interceptor.redactHeader('x-super-secret-header')
interceptor.redactHeaders(['x-other-secret-header', 'x-one-more-secret-header'])

const api = DrizzleBuilder.newBuilder()
  .baseUrl(address)
  .callFactory(UndiciCallFactory.DEFAULT)
  .addInterceptor(interceptor)
  .build()
  .create(API)
```

## Features

You can change the level using the following values: `NONE, BASIC, HEADERS, BODY`.  
To customize the default Pino implementation, provide a custom instance of **PinoLogger**. E.g.:

```typescript
const customPinoLogger = new PinoLogger({ /* pino.LoggerOptions */ })

const api = DrizzleBuilder.newBuilder()
  .baseUrl(address)
  .callFactory(UndiciCallFactory.DEFAULT)
  .addInterceptor(new LoggingInterceptor(customPinoLogger))
  .build()
  .create(API)
```

To avoid logging sensitive information on Headers, use:

```typescript
loggingInterceptor.redactHeader('secret-header')
```
