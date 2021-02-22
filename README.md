<p style="text-align: center" align="center">
  <a href="https://github.com/vitorsalgado/drizzle-http" target="_blank"><img src="docs/assets/drizzle.png" width="150px" alt="Drizzle HTTP Logo" /></a>
</p>

# Drizzle HTTP

![ci](https://github.com/vitorsalgado/drizzle-http/workflows/ci/badge.svg)
[![codecov](https://codecov.io/gh/vitorsalgado/drizzle-http/branch/main/graph/badge.svg?token=XU2YHXHAEH)](https://codecov.io/gh/vitorsalgado/drizzle-http)
[![Maintainability](https://api.codeclimate.com/v1/badges/b8af30859a8e2c939517/maintainability)](https://codeclimate.com/github/vitorsalgado/drizzle-http/maintainability) 
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-blue.svg)](https://conventionalcommits.org)

> Decorator based HTTP client fully written in **Typescript**.  
> Inspired by [Retrofit](https://github.com/square/retrofit) and [Feign](https://github.com/OpenFeign/feign).

> IMPORTANT! This library is still experimental.
---

## What it is

**Drizzle-HTTP** is a library that makes writing http clients in Typescript and Javascript easier by using decorators to
configure http calls.  
It takes performance in consideration and request configurations are pre-processed to make calls faster.  
The core package uses only one dependency, [Reflect Metadata](https://www.npmjs.com/package/reflect-metadata).

**Note!**: Decorators need to be applied to concrete Classes only.

## Table of Contents

- [Packages](#packages)
- [Features](#features)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Overview](#overview)
- [Benchmarks](#benchmarks)

## Packages

See all [available packages](pkgs/README.md) in this monorepo.

## Features

- Define HTTP requests with decorators, including path parameters, querystring, headers, body
- Extensible
- Add custom request and response converters
- Add custom method adapters to use libs like RxJs. See an example [here](pkgs/drizzle-http-rxjs-adapter).
- Add interceptors
- Request cancellation

## Installation

Drizzle-HTTP is divided in different packages. The main package `@drizzle-http/core` just contain the core components.
You need to install additional packages to make Drizzle-HTTP work. E.g.:  
Install both `@drizzle-http/core` and `@drizzle-http/undic` to have a basic setup for a backend app.  
To make things easier, there are two packages that contains defaults for **Node.js** and **Browser** usage.  
See below:

```
Node.js

npm i @drizzle-http/nodejs
or
yarn add @drizzle-http/nodejs
```

More details: [here](pkgs/drizzle-http-nodejs)

```
Browser

npm i @drizzle-http/browser
or
yarn add @drizzle-http/browser
```

More details: [here](pkgs/drizzle-http-browser)

## Getting Started

Go to [docs](docs/README.md) to see how to use Drizzle-HTTP in your project.

## Overview

### Basics

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
} from '@drizzle-http/core'
import { UndiciCallFactory } from '@drizzle-http/undici'
import { Level, LoggingInterceptor, PinoLogger } from '@drizzle-http/logging-interceptor'

interface Project {
  id: string
  name: string
}

@HeaderMap({ 'Global-Header': 'Value' })
@Timeout(5, 5)
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

For more details, check [getting started](docs/README.md) docs.

## Benchmarks

```
yarn benchmark
```

```
Machine: MacBook Pro (13-inch, 2019)
Processor: 2,8 GHz Quad-Core Intel Core i7
Memory: 16 GB 2133 MHz LPDDR3
Node: 15

drizzle-http x 1,248 ops/sec ±1.25% (77 runs sampled)
drizzle-http no args x 1,347 ops/sec ±0.93% (76 runs sampled)
undici pool request x 1,259 ops/sec ±1.26% (78 runs sampled)
undici pool request no args x 1,324 ops/sec ±1.09% (76 runs sampled)
http x 1,235 ops/sec ±1.76% (74 runs sampled)
axios x 1,015 ops/sec ±5.29% (71 runs sampled)
undici-fetch x 1,335 ops/sec ±1.27% (78 runs sampled)
node-fetch x 1,156 ops/sec ±1.36% (78 runs sampled)
```

This benchmark consists in different clients performing calls to server that responds a 80kb JSON with multiple
connections.

## License

Drizzle HTTP is [MIT Licensed](LICENSE).
