# Drizzle-HTTP &middot; [![ci](https://github.com/vitorsalgado/drizzle-http/workflows/ci/badge.svg)](https://github.com/vitorsalgado/drizzle-http/actions) [![npm](https://img.shields.io/npm/v/drizzle-http)](https://www.npmjs.com/package/drizzle-http) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/vitorsalgado/drizzle-http/blob/main/LICENSE)

Decorator based HTTP client written in **Typescript**.  
Inspired by [Retrofit](https://github.com/square/retrofit) and [Feign](https://github.com/OpenFeign/feign).

---

## What it is

**Drizzle-HTTP** is a library that makes writing http clients in Typescript and Javascript easier by using decorators to
configure http calls.  
It takes performance in consideration and request configurations are pre-processed to make calls faster.

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Getting Started](#getting-started)
- [Overview](#overview)
- [Decorators](#decorators)
- [Examples](#examples)
- [Benchmarks](https://github.com/vitorsalgado/drizzle-http#benchmarks)
- [Contributing](https://github.com/vitorsalgado/drizzle-http#contributing)

## Installation

### NPM

```
npm i drizzle-http
```

### Yarn

```
yarn add drizzle-http
```

## Features

- Define HTTP requests with decorators, including path parameters, querystring, headers, body
- Extensible
- Add custom request and response converters
- Add custom method adapters to use libs like RxJs. See an example [here](../rxjs-adapter).
- Add interceptors
- Request cancellation

## Getting Started

Go to [docs](https://github.com/vitorsalgado/drizzle-http/tree/main/docs) to see how to use Drizzle-HTTP with more
details.

## Overview

Usage typically looks like the example below:

```typescript
import {
  DrizzleBuilder,
  AsJson,
  HttpError,
  Response,
  Header,
  HeaderMap,
  QueryName,
  Query,
  Param,
  GET,
  Timeout,
  MediaTypes,
  UndiciCallFactory,
  Level,
  LoggingInterceptor,
  PinoLogger
} from 'drizzle-http'

interface Project {
  id: string
  name: string
}

@HeaderMap({ 'Global-Header': 'Value' })
@Timeout(2500, 2500)
class API {
  @GET('/group/{id}/owner/{name}/projects')
  @HeaderMap({ 'Method-Level-Fixed-Header': 'Other-Value' })
  @ContentType(MediaTypes.APPLICATION_JSON_UTF8)
  projects(
    @Param('id') id: string,
    @Param('name') name: string,
    @Query('filter') filter: string[],
    @Query('sort') sort: string,
    @QueryName() prop: string,
    @Header('cache') cache: boolean,
    @Header('code') code: number): Promise<Project[]> {
  }

  @GET('/{id}/projects')
  @AsJson()
  otherProjects(@Param('id') id: string, @Query('sort') orderBy: string): Promise<Response> {
    // it's not mandatory to pass all args to theTypes() function
    // this is just to avoid Lint problems if you don't want to disable analyzes all the time.

    // when passing Response as the second argument, it enables the raw converter and the 
    // response will be a Fetch similar response type
    // you could use the @FullResponse() decorator too
    return theTypes(Promise, Response, id, orderBy)
  }
}

const api: API = DrizzleBuilder.newBuilder()
  .baseUrl('http://some.nice.addr/')
  .callFactory(UndiciCallFactory.DEFAULT)
  .addInterceptor(new LoggingInterceptor(PinoLogger.DEFAULT, Level.BODY))
  .build()
  .create(API)

api
  .projects('proj-100', 'john doe', ['all', 'active'], 'asc', 'withReports()', false, 100)
  .then(projects => projects.forEach(console.log))
  .catch((err: HttpError) => {
    console.log(err.response.url)
    console.log(err.response.status)
  })

api
  .otherProjects('5500', 'desc')
  .then(response => {
    console.log(response.status)

    return response.json()
  })
  .then((projects: Project[]) => projects.forEach(console.log))
```

## Decorators

| Decorator      | Description | Target |
| -------------- | ----------- | ------ |
| @ReturnType()        | Define the return types of a method. Used to internally detect the correct request/response converters and adapters. | Method |
| @GET()         | Define a HTTP `GET` request. | Method |
| @POST()         | Define a HTTP `POST` request. | Method |
| @PUT()         | Define a HTTP `PUT` request. | Method |
| @DELETE()         | Define a HTTP `DELETE` request. | Method | 
| @PATCH()         | Define a HTTP `PATCH` request. | Method |
| @OPTIONS()         | Define a HTTP `OPTIONS` request. | Method |
| @HEAD()         | Define a HTTP `HEAD` request. | Method |
| @Body()  | Defines a parameter to be a request body. | Parameter |
| @Param() or P() | Define a path parameter to replace `{PARAM}` url template parameters | Parameter |
| @Query() or Q() | Define a querystring parameter | Parameter |
| @QueryName() or Qn() | Define a querystring name parameter | Parameter |
| @Field() or F()        | Define a `form-urlencoded` parameter | Parameter |
| @Header()        | Define a header parameter | Parameter |
| @HeaderMap()        | Define fixed headers | Class, Method |
| @FormUrlEncoded()        | Define a `form-urlencoded` request | Method |
| @AsJson()        | Define a `application-json` `content-type` header | Class, Method |
| @Accept()         | Configure `Accept` headers.      | Class, Method |
| @ContentType()         | Configure `Content-Type` header. | Class, Method | 
| @Path()        | Define an additional url path. The value accepts template parameters. | Class |
| @Abort()         | Configure request cancellation. Pass a `Event Emitter` instance. Cancel with an `abort` event.      | Class, Method or Parameter |
| @Timeout()        | Define the timeouts of a request | Class, Method |

## Examples

[Here](https://github.com/vitorsalgado/drizzle-http/tree/main/examples) we have some usage examples available.
