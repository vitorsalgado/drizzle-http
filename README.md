<h1 align='center'>Drizzle HTTP</h1>

<p align='center'>
  <img src="docs/assets/drizzle.png" alt="Repository Logo" width='100px' height='100px' />
  <br />
  <br/>
  <i>Decorator based HTTP client written in <strong>vanilla Typescript</strong>.</i>
</p>

<p align='center'>
  <a href='https://www.npmjs.com/settings/drizzle-http/packages' target='_blank'><strong>NPM Packages</strong></a><br/>
  <a href='https://deno.land/x/drizzle_http' target='_blank'><strong>Deno</strong></a><br/>
</p>

<p align='center'>
  <a href="https://github.com/vitorsalgado/drizzle-http/actions/workflows/ci.yml">
    <img src="https://github.com/vitorsalgado/drizzle-http/actions/workflows/ci.yml/badge.svg" alt="GitHub Action Status" />
  </a>
  <a href="https://codecov.io/gh/vitorsalgado/drizzle-http">
    <img src="https://codecov.io/gh/vitorsalgado/drizzle-http/branch/main/graph/badge.svg?token=XU2YHXHAEH" alt="Codecov" />
  </a>
  <a href="https://www.npmjs.com/settings/drizzle-http/packages">
    <img src="https://img.shields.io/npm/v/@drizzle-http/core?logo=npm" alt="NPM Package" />  
  </a>
  <a href="https://deno.land/x/drizzle_http">
    <img src="https://img.shields.io/badge/available%20on-deno.land-lightgrey?logo=deno&labelColor=black" alt="Deno Package"/>
  </a>
  <a href="https://conventionalcommits.org">
    <img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-blue.svg?logo=git" alt="Conventional Commits"/>
  </a>
</p>

---

## What it is

**Drizzle-HTTP** is library inspired by [Retrofit](https://github.com/square/retrofit)
and [Feign](https://github.com/OpenFeign/feign), that let you create API clients using **decorators**.

## Table of Contents

- [Installation](#installation)
- [Packages](packages)
- [Getting Started](#getting-started)
- [Features](#features)
- [Examples](examples)
- [Common Issues](#common-issues)
- [Benchmarks](#benchmarks)
- [Contributing](#contributing)

## Installation

Drizzle-HTTP is a monorepo with several packages. You will need to install at least the core module, @drizzle-http/core,
along with one or more extensions.  
For a basic usage in a **Node.js Backend Environment**, you can install:

```
npm i @drizzle-http/core
npm i @drizzle-http/undici
```

For browser environments:

```
npm i @drizzle-http/core
npm i @drizzle-http/fetch
```

## Getting Started

By default, request and response bodies will be handled as JSON. Will can change this with the appropriate decorators.  
It will not set the content type by default.

### Overview

Usage typically looks like the example below:

```typescript
import { newAPI, Timeout } from '@drizzle-http/core'
import { GET } from "@drizzle-http/core";
import { Path } from "@drizzle-http/core";
import { Param } from "@drizzle-http/core";
import { POST } from "@drizzle-http/core";
import { Body } from "@drizzle-http/core";
import { HttpResponse } from "@drizzle-http/core";
import { PUT } from "@drizzle-http/core";
import { DELETE } from "@drizzle-http/core";
import { ParseErrorBody } from "@drizzle-http/core";
import { Query } from "@drizzle-http/core";
import { HeaderMap } from "@drizzle-http/core";
import { UndiciCallFactory } from "@drizzle-http/undici";
import { ContentType } from "@drizzle-http/core";
import { MediaTypes } from "@drizzle-http/core";

@Timeout(15e30)
@Path('/customers')
@HeaderMap({ 'x-app-id': 'example-app' })
@ContentType(MediaTypes.APPLICATION_JSON)
class CustomerAPI {
  @GET()
  search (@Query('filter') filter: string, @Query('sort') sort: string): Promise<Customer[]> {
  }

  @GET('/{id}')
  byId (@Param('id') id: string): Promise<Customer> {
  }

  @POST()
  @ParseErrorBody()
  add (@Body() customer: Customer): Promise<HttpResponse> {
  }

  @PUT('/{id}')
  update (@Param('id') id: string, @Body() customer: Customer): Promise<HttpResponse> {
  }

  @DELETE('/{id}')
  remove (@Param('id') id: string): Promise<HttpResponse> {
  }
}

const api = newAPI()
  .baseUrl('https://example.com')
  .callFactory(new UndiciCallFactory())
  .build()
  .create(CustomerAPI)

const customer = await api.byId('100')
```

<!---
// @formatter:off
-->

### Basic Decorators

| Decorator             | Description                                                                                    | Target                     |
|-----------------------|------------------------------------------------------------------------------------------------|----------------------------|
| @GET()                | Define a HTTP `GET` request.                                                                   | Method                     |
| @POST()               | Define a HTTP `POST` request.                                                                  | Method                     |
| @PUT()                | Define a HTTP `PUT` request.                                                                   | Method                     |
| @DELETE()             | Define a HTTP `DELETE` request.                                                                | Method                     | 
| @PATCH()              | Define a HTTP `PATCH` request.                                                                 | Method                     |
| @OPTIONS()            | Define a HTTP `OPTIONS` request.                                                               | Method                     |
| @HEAD()               | Define a HTTP `HEAD` request.                                                                  | Method                     |
| @HTTP()               | Define a custom HTTP method for a request.                                                     | Method                     |
| @Body()               | Mark the parameter that will be the request body.                                              | Parameter                  |
| @Param()              | Define a path parameter that will replace a `{PARAM}` url template value                       | Parameter                  |
| @Query()              | Define a querystring parameter                                                                 | Parameter                  |
| @QueryName()          | Define a querystring name parameter                                                            | Parameter                  |
| @Field()              | Define a `form-urlencoded` field parameter                                                     | Parameter                  |
| @Header()             | Define a header parameter                                                                      | Parameter                  |
| @HeaderMap()          | Define fixed headers                                                                           | Class, Method              |
| @FormUrlEncoded()     | Define a `form-urlencoded` request                                                             | Class, Method              |
| @Multipart()          | Create a multipart/form-data request (**Fetch Only**)                                          | Class, Method              |
| @Part()               | Mark a parameter as a part of multipart/form-data request body (**Fetch Only**)                | Parameter                  |
| @BodyKey()            | Change the name of part in a multipart/form-data request (**Fetch Only**)                      | Parameter                  |
| @Accept()             | Define `Accept` header.                                                                        | Class, Method              |
| @ContentType()        | Define `Content-Type` header.                                                                  | Class, Method              | 
| @Path()               | Define an additional url path. The value accepts template parameters.                          | Class                      |
| @Abort()              | Configure request cancellation. Pass a `Event Emitter` instance. Cancel with an `abort` event. | Class, Method or Parameter |
| @Timeout()            | Define the timeouts of a request                                                               | Class, Method              |
| @ParseErrorBody()     | Parse error body. Can use a custom body converter                                              | Class, Method              |
| @NoDrizzleUserAgent() | Remove Drizzle-HTTP custom user-agent header                                                   | Class                      |
| @JsonRequest()        | Use JSON request body converter (**default**)                                                  | Class, Method              |
| @JsonResponse()       | Use JSON response converter (**default**)                                                      | Class, Method              |
| @UseJsonConv()        | Use JSON request/response converters (**default**)                                             | Class, Method              |
| @PlainTextRequest()   | Use plain text request body converter                                                          | Class, Method              |
| @PlainTextResponse()  | Use plain text response converter                                                              | Class, Method              |
| @UsePlainTextConv()   | Use plain text request/response converters                                                     | Class, Method              |
| @RequestType()        | Define a custom request body converter                                                         | Class, Method              |
| @ResponseType()       | Define a custom response converter                                                             | Class, Method              |
| @Model()              | Define a parameter that will hold the request definition. Used along with @To() decorator      | Class, Method              |
| @To()                 | Map @Model() class properties and methods to a request                                         | Class, Method              |

<!---
// @formatter:on
-->

### Defaults

Default values that Drizzle starts with. All values can be overridden using decorators.

- Timeout: 30 seconds
- Request Body Converter: JSON
- Response Body Converter: JSON

## Features

- Define HTTP requests with decorators, including path parameters, querystring, headers, body and so on.
- Extensible
- Custom response adapters
- Request interceptors
- Abort requests
- Timeouts
- Parse responses to objects or get the raw response in a fetch like format
- Parse error response bodies
- **RxJs** support with [RxJs Adapter](packages/drizzle-rxjs)
- Map responses with [Response Mapper Adapter](packages/drizzle-response-mapper)
- **Circuit Breaker** with **Opossum** with [this adapter](packages/drizzle-opossum-circuit-breaker)
- **Deno** support

### Browser

For Browser usage, take a look on [this implementation](packages/drizzle-fetch). It uses **fetch** to make HTTP
requests.

### Deno

A version for **Deno** is available on [https://deno.land/x/drizzle_http](https://deno.land/x/drizzle_http).  
The Deno version is simpler than the one available for Node.js. It contains the **core** module and a fetch client
implementation specific for Deno.  
More details and usage example [here](deno).

### Interceptors

You can intercept requests and responses using [Interceptors](packages/drizzle-core/Interceptor.ts).  
You can a simple function, `chain => {}`, an `Intepcetor` interface implementation or an `InterceptorFactory`
implementation, if you need more configurations.  
Take a look on the examples below:

```typescript
class CustomerAPI {
  @GET('/{id}')
  getById (@Param('id') id: string): Promise<Customer> {
    return noop(id)
  }
}

const api = newAPI()
  .addInterceptor(async chain => {
    console.log('before request')

    const response = await chain.proceed(chain.request())

    console.log('after request')

    return response
  })
  .baseUrl('https://example.com')
  .callFactory(new UndiciCallFactory())
  .createAPI(CustomerAPI)
```

### Circuit Breaker

With the package [@drizzle-http/opossum-circuit-breaker](packages/drizzle-opossum-circuit-breaker), you can protect your
endpoints with circuit breakers.  
It uses [Opossum](https://github.com/nodeshift/opossum) circuit breaker implementation.  
See a basic demonstration below. More details [here](packages/drizzle-opossum-circuit-breaker).

```typescript
import { CircuitBreaker } from "@drizzle-http/opossum-circuit-breaker";
import { Fallback } from "@drizzle-http/opossum-circuit-breaker";

@Timeout(15e30)
@Path('/customers')
@HeaderMap({ 'x-app-id': 'example-app' })
class CustomerAPI {
  @GET()
  @CircuitBreaker()
  search (@Query('filter') filter: string, @Query('sort') sort: string): Promise<Customer[]> {
  }

  @GET('/{id}')
  @CircuitBreaker()
  @Fallback((id: string, error: Error) => { /** fallback logic **/
  })
  byId (@Param('id') id: string): Promise<Customer> {
  }
}
```

### Raw HTTP Response

By the default, HTTP success responses you be parsed and resolved and http errors will be rejected. If you want the raw
HTTP response, including headers, status codes, body stream, decorate your method with `@RawResponse()` and the return
will be a `Promise<HttpResponse>`, similar to Fetch. In this case, HTTP errors will not be rejected.

### Form URL Encoded

To make `application/x-www-form-urlencoded` request, decorate your class or method with `@FormUrlEncoded()`.  
Use `@Field()` to define a parameter as a form field entry.  
If using `@Body()`, object keys will be converted to url form encoded format.

## Common Issues

### ESLint and TS Check Problems

The API class methods doesn't need to have a body, but TS and some ESLint configurations will complain with the empty
body and maybe the unused parameters. To solve this, you can:

- Use the helper function `noop()` in all method bodies. This function does nothing, but it will have the same return
  type as your method, and you can pass all method arguments removing any lint issues.
- Disable TS check for the API class file with the comment: `// @ts-nocheck`
- Disable or relax ESLint checks for the file or class

Example:

```typescript
import { noop } from "@drizzle-http/core";

class CustomerAPI {
  @GET('/{id}')
  byId (@Param('id') id: string): Promise<Customer> {
    return noop(id)
  }

  @POST()
  @ParseErrorBody()
  add (@Body() customer: Customer): Promise<HttpResponse> {
    return noop(customer)
  }
}
```

### Request/Response Mismatch

You need to be very explicitly regarding the API class and method configurations as Drizzle is unable to detect stuff
like the generic return type of methods. For example, if you want the raw response, to gain access to all the details of
a http response, you need to explicitly decorate your method with `@RawResponse()`.

## Benchmarks

### Run

```
npm run benchmark
```

### Results

```
Machine: MacBook Pro (13-inch, 2019)
Processor: 2,8 GHz Quad-Core Intel Core i7
Memory: 16 GB 2133 MHz LPDDR3
Node: 15

drizzle-http - undici x 1,263 ops/sec ±1.13% (76 runs sampled)
drizzle-http - fetch x 1,034 ops/sec ±2.21% (74 runs sampled)
undici - pool - request x 1,225 ops/sec ±1.08% (74 runs sampled)
http x 1,254 ops/sec ±1.41% (75 runs sampled)
axios x 1,026 ops/sec ±2.04% (78 runs sampled)
got x 1,054 ops/sec ±1.56% (75 runs sampled)
undici-fetch x 1,339 ops/sec ±1.47% (79 runs sampled)
node-fetch x 1,147 ops/sec ±1.42% (78 runs sampled)
drizzle-http - stream x 3,516 ops/sec ±2.47% (73 runs sampled)
undici - stream x 3,560 ops/sec ±2.00% (74 runs sampled)
```

This benchmark consists in a client with multiple connections performing calls to a server that responds a 80kb JSON.

## Contributing

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-blue.svg)](https://conventionalcommits.org)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://github.com/prettier/prettier)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest)

See [CONTRIBUTING](CONTRIBUTING.md) for more details.

## License

Drizzle HTTP is [MIT Licensed](LICENSE).
