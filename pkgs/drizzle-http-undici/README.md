# Undici Client &middot; [![ci](https://github.com/vitorsalgado/drizzle-http/workflows/ci/badge.svg)](https://github.com/vitorsalgado/drizzle-http/actions) [![npm (scoped)](https://img.shields.io/npm/v/@drizzle-http/undici)](https://www.npmjs.com/package/@drizzle-http/undici) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/vitorsalgado/drizzle-http/blob/main/LICENSE)

[Drizzle-Http](https://github.com/vitorsalgado/drizzle-http) client implementation based
on [Undici](https://github.com/nodejs/undici).

## Installation

The main package, [Drizzle-Http](https://www.npmjs.com/package/drizzle-http), already contains this module.  
If you are installing each package individually, make sure to install
first [@Drizzle-Http/core](https://www.npmjs.com/package/@drizzle-http/core) with: `npm i @drizzle-http/core`

### NPM

```
npm i @drizzle-http/undici
```

### Yarn

```
yarn add @drizzle-http/undici
```

## Features

- Customize undici pool
- Allows the response to be written direct to
  a [Writable](https://nodejs.org/api/stream.html#stream_class_stream_writable).

## Usage

### Basic setup

```typescript
const api: API = DrizzleBuilder.newBuilder()
  .baseUrl(addr)
  .callFactory(UndiciCallFactory.DEFAULT)
  .build()
```

## Stream

This feature uses
undici [client.stream](https://github.com/nodejs/undici#clientstreamopts-factorydata-callbackerr-promisevoid) feature.  
Example:

```typescript
@Timeout(10)
class API {
  @GET('/')
  @ContentType('application/json')
  @Streaming()
  streaming(@StreamTo() target: Writable): Promise<StreamToResult> {
    return theTypes(Promise, StreamToResult)
  }
}
```

## Customization

Provide custom undici Pool options on UndiciCallFactory constructor.
