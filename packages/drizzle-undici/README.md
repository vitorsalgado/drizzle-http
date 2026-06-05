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
- Stream responses directly to a `Writable` via `@StreamTo()`

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

## Streaming

Uses [undici.stream](https://github.com/nodejs/undici#undicistreamurl-options-factory-promise). The method promise resolves when **response headers** arrive; body bytes pipe to the `@StreamTo()` argument; `response.completed` resolves when the stream finishes.

```typescript
import { Streaming, StreamTo, StreamingResponse } from "@drizzle-http/undici";
import { GET, Params } from "@drizzle-http/core";
import { Writable } from "stream";

class API {
  @GET('/')
  @Streaming()
  @Params([StreamTo()])
  async download(target: Writable): Promise<StreamingResponse> {
    const response = await /* drizzle invokes this */;
    if (!response.ok) {
      await response.completed;
      throw new Error(`HTTP ${response.status}`);
    }
    await response.completed;
    return response;
  }
}
```

### Two-phase response

| Phase | API | When |
|-------|-----|------|
| Headers | `await api.download(dest)` → `status`, `headers`, `ok` | Undici factory (before body bytes) |
| Body | bytes written to `@StreamTo()` writable | in flight |
| Done | `await response.completed` → `{ trailers }` | stream finished |

Failures before headers reject the outer promise. Failures after headers reject `response.completed`.

### Options

```typescript
@Streaming({
  // Synchronous hook inside undici factory — use for HTTP proxies (writeHead before bytes)
  onHeaders: ({ statusCode, headers, destination, response }) => {
    (destination as ServerResponse).writeHead(statusCode, headers);
    return destination;
  },
  // Default true: status >= 400 bodies are discarded, not written to @StreamTo
  skipErrorBody: true,
})
```

Set `skipErrorBody: false` to stream error response bodies to the destination.

### Constraints

- Use `@Params([StreamTo()])` (only one `@StreamTo()` per method).
- `@Streaming()` cannot be combined with `@Retry()` — add `@NoRetry()` if the class has global retry.
- Callers must handle backpressure on the destination `Writable`.
- Bodies are raw bytes (`content-encoding` is not decoded on the stream path).
