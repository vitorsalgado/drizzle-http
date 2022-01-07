# Fetch Client &middot; [![ci](https://github.com/vitorsalgado/drizzle-http/workflows/ci/badge.svg)](https://github.com/vitorsalgado/drizzle-http/actions) [![npm (scoped)](https://img.shields.io/npm/v/@drizzle-http/fetch)](https://www.npmjs.com/package/@drizzle-http/fetch) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/vitorsalgado/drizzle-http/blob/main/LICENSE)

Fetch based HTTP client implementation for [Drizzle-Http](https://github.com/vitorsalgado/drizzle-http).  
This library contains several [decorators](#fetch-specific-decorators) to facilitate the definition of a Fetch request.

## Installation

Make sure we have the core module [@Drizzle-Http/core](https://www.npmjs.com/package/@drizzle-http/core) installed.

```
npm i @drizzle-http/core
npm i @drizzle-http/fetch
```

## Usage

### Typescript

```typescript
import { GET } from "@drizzle-http/core";
import { RawResponse } from "@drizzle-http/core";
import { Multipart } from "@drizzle-http/core";
import { POST } from "@drizzle-http/core";
import { Part } from "@drizzle-http/core";
import { newAPI } from ".@drizzle-http/core";
import { useFetch } from "@drizzle-http/fetch";
import { CORS } from "@drizzle-http/fetch";

@CORS()
class API {
  @GET('/')
  @RawResponse()
  raw (): Promise<Response> {
  }

  @GET('/customer')
  customers (): Promise<Customer[]> {
  }

  @POST('/')
  @Multipart()
  @RawResponse()
  send (@Part() desc: string, @Part() file: File): Promise<Response> {
  }
}

const api = newAPI()
  .baseUrl(addr)
  .configurer(useFetch())
  .createAPI(API)
```

## Fetch Specific Decorators

| Decorator         | Description                                                      | Target        |
|-------------------|------------------------------------------------------------------|---------------|
| @Cache()          | Configure RequestInit.cache. Parameter: RequestCache             | Class, Method |
| @CORS()           | Set RequestInit.mode to 'cors'                                   | Class, Method |
| @Credentials()    | Configure RequestInit.credentials. Parameter: RequestCredentials | Class, Method |
| @Integrity()      | Configure RequestInit.integrity                                  | Class, Method |
| @KeepAlive()      | Configure RequestInit.keepAlive                                  | Class, Method |
| @Mode()           | Configure RequestInit.mode                                       | Class, Method |
| @Redirect()       | Configure RequestInit.redirect                                   | Class, Method |
| @Referrer()       | Configure RequestInit.referrer                                   | Class, Method |
| @ReferrerPolicy() | Configure RequestInit.referrerPolicy                             | Class, Method |
| @Multipart()      | Create a multipart/form-data request                             | Class, Method |
| @Part()           | Mark a parameter as a part of multipart/form-data request body   | Parameter     |
| @BodyKey()        | Change the name of part in a multipart/form-data request         | Parameter     |

## Features

### Raw Fetch Response

By the default, http success responses you be parsed and resolved and http errors will be rejected. If you want the raw
Fetch http response, decorate your method with `@RawResponse()` and the return will be a `Promise<Response>`, same as
Fetch. In this case, http errors will be not rejected.

### Multi Part

To make a `multipart/form-data` request, decorate your method with `@Multipart()`.  
Use the decorator `@Part()` to mark a parameter as an entry in a FormData object.  
You can also send a `@Body()` parameter with a `File`, `File[]`, `FormData` or an `HTML Form`.
