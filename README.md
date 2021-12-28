<a href="https://github.com/vitorsalgado/drizzle-http" target="_blank"><img src="docs/assets/drizzle.png" alt="Drizzle HTTP Logo"  width="140px" align="right" /></a>

# Drizzle HTTP

[![ci](https://github.com/vitorsalgado/drizzle-http/workflows/ci/badge.svg)](https://github.com/vitorsalgado/drizzle-http/actions)
[![npm](https://img.shields.io/npm/v/drizzle-http)](https://www.npmjs.com/package/drizzle-http)
[![codecov](https://codecov.io/gh/vitorsalgado/drizzle-http/branch/main/graph/badge.svg?token=XU2YHXHAEH)](https://codecov.io/gh/vitorsalgado/drizzle-http)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Decorator based HTTP client written in **Typescript**.  
Inspired by [Retrofit](https://github.com/square/retrofit) and [Feign](https://github.com/OpenFeign/feign).

---

## What it is

**Drizzle-HTTP** is a library that makes writing http clients in Typescript and Javascript easier by using decorators to
configure http calls.  
It takes performance in consideration and request configurations are pre-processed to make calls faster.

## Table of Contents

- [Installation](#installation)
- [Packages](#packages)
- [Features](#features)
- [Getting Started](#getting-started)
- [Overview](#overview)
- [Examples](#examples)
- [Benchmarks](#benchmarks)
- [Contributing](#contributing)

## Installation

Drizzle-HTTP is divided in several packages.  
The package `drizzle-http` provides all builtin packages contained in this monorepo.  
If you which to install each package individually, bear in mind that you will always need the core
package `@drizzle-http/core`.  
See below installation instructions for `drizzle-http` main package:

### NPM

```
npm i drizzle-http
```

### Yarn

```
yarn add drizzle-http
```

## Packages

See all [available packages](packages/README.md) in this monorepo.

## Features

- Define HTTP requests with decorators, including path parameters, querystring, headers, body
- Extensible
- Add custom request and response converters
- Add custom method adapters to use libs like RxJs. See an example [here](packages/drizzle-http-rxjs-adapter).
- Add interceptors
- Request cancellation

## Getting Started

Go to [docs](docs/README.md) to see how to use Drizzle-HTTP in your project.

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

For more details, check [getting started](docs/README.md) docs.

## Examples

We have some usage examples available in this [directory](examples).

## Benchmarks

### Run

```
yarn benchmark
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

This benchmark consists in different clients performing calls to server that responds a 80kb JSON with multiple
connections.

## Contributing

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-blue.svg)](https://conventionalcommits.org)
[![Maintainability](https://api.codeclimate.com/v1/badges/b8af30859a8e2c939517/maintainability)](https://codeclimate.com/github/vitorsalgado/drizzle-http/maintainability)

See [CONTRIBUTING](CONTRIBUTING.md) for more details.

## License

Drizzle HTTP is [MIT Licensed](LICENSE).
