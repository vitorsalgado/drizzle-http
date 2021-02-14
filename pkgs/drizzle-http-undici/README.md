# Undici Client for Drizzle-HTTP

![CI](https://github.com/vitorsalgado/drizzle-http/workflows/CI/badge.svg)

HTTP Call client implementation based on [Undici](https://github.com/nodejs/undici).

## Installation

```
npm i @drizzle-http/core
npm i @drizzle-http/undici
```

## Features

- Customize undici pool
- Allows the response to be written direct to
  a [Writable](https://nodejs.org/api/stream.html#stream_class_stream_writable).

## Usage

### Basic setup

```typescript
const api: API = Drizzle.builder()
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
