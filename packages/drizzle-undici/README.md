# Undici Client &middot; [![ci](https://github.com/vitorsalgado/drizzle-http/workflows/ci/badge.svg)](https://github.com/vitorsalgado/drizzle-http/actions) [![npm (scoped)](https://img.shields.io/npm/v/@drizzle-http/undici)](https://www.npmjs.com/package/@drizzle-http/undici) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/vitorsalgado/drizzle-http/blob/main/LICENSE)

[Drizzle-Http](https://github.com/vitorsalgado/drizzle-http) client implementation using
[Undici](https://github.com/nodejs/undici).

## Installation

Make sure we have the core module [@Drizzle-Http/core](https://www.npmjs.com/package/@drizzle-http/core) installed.

```
npm i @drizzle-http/core
npm i @drizzle-http/undici
```

## Features

- Customize Undici pool
- Allows the response to be written direct to stream.

## Usage

### Basic setup

```typescript
import { UndiciCallFactory } from "@drizzle-http/undici";
import { DrizzleBuilder } from "@drizzle-http/core";

const api = DrizzleBuilder
  .newBuilder()
  .baseUrl(addr)
  .callFactory(new UndiciCallFactory())
  .build()
  .create(API)
```

## Stream

This feature uses [undici.stream](https://github.com/nodejs/undici#undicistreamurl-options-factory-promise) feature.  
Example:

```typescript
import { StreamingResponse } from "@drizzle-http/undici";
import { Streaming } from "@drizzle-http/undici";
import { StreamTo } from "@drizzle-http/undici";
import { GET } from "@drizzle-http/core";

class API {
  @GET('/')
  @Streaming()
  streaming(@StreamTo() target: Writable): Promise<StreamingResponse> { }
}
```
