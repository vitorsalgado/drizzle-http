# Drizzle-Http Core &middot; [![ci](https://github.com/vitorsalgado/drizzle-http/workflows/ci/badge.svg)](https://github.com/vitorsalgado/drizzle-http/actions) [![npm (scoped)](https://img.shields.io/npm/v/@drizzle-http/core)](https://www.npmjs.com/package/@drizzle-http/core) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/vitorsalgado/drizzle-http/blob/main/LICENSE)

This is core package for Drizzle-HTTP. All modules are based on this core project.  
This is **vanilla Typescript** project that **doesn't** contains external dependencies.  
For Node.js backends, install the Undici client adapter alongside core:

```
npm i @drizzle-http/core
npm i @drizzle-http/undici
```

For browser environments, core includes a built-in native **fetch** client — no extra package required.

## Installation

```
npm i @drizzle-http/core
```

## Browser (Fetch)

The native fetch client lives in [`builtin/fetch`](builtin/fetch). Use `useFetch()` to wire the call factory, multipart handlers, and fetch-specific decorators:

```typescript
import { newAPI, GET, RawResponse } from '@drizzle-http/core'
import { useFetch, CORS } from '@drizzle-http/core'

@CORS()
class MyAPI {
  @GET('/txt')
  @RawResponse()
  txt(): Promise<Response> {
    // ...
  }
}

const api = newAPI().baseUrl('https://example.com').configurer(useFetch()).build().create(MyAPI)
```

### Migration from `@drizzle-http/fetch`

`@drizzle-http/fetch` was merged into core in v4. Update imports:

```typescript
// Before
import { useFetch, CORS } from '@drizzle-http/fetch'

// After
import { useFetch, CORS } from '@drizzle-http/core'
```
