# Fetch Client &middot; [![ci](https://github.com/vitorsalgado/drizzle-http/workflows/ci/badge.svg)](https://github.com/vitorsalgado/drizzle-http/actions) [![npm (scoped)](https://img.shields.io/npm/v/@drizzle-http/fetch)](https://www.npmjs.com/package/@drizzle-http/fetch) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/vitorsalgado/drizzle-http/blob/main/LICENSE)

Fetch based HTTP client implementation for [Drizzle-Http](https://github.com/vitorsalgado/drizzle-http).  
This library contains several [decorators](#additional-decorators) to facilitate the definition of some request parameters for Fetch.  
When used on Browser based applications, `window.fetch` will be used. On Node.js, [Node-Fetch](https://github.com/node-fetch/node-fetch).  
**NOTE**: Different from Fetch default behaviour, in this library, 3xx-5xx are **exceptions** and should be handled on `.catch()` method.

## Installation

The main package, [Drizzle-Http](https://www.npmjs.com/package/drizzle-http), already contains this module.  
If you are installing each package individually, make sure to install first [@Drizzle-Http/core](https://www.npmjs.com/package/@drizzle-http/core) with: `npm i @drizzle-http/core`

### NPM

```
npm i @drizzle-http/fetch
```

### Yarn

```
yarn add @drizzle-http/fetch
```

## Usage

### Typescript

```typescript
class ApiTs {
  @GET('/')
  @ContentType('application/json;charset=utf-8')
  @CORS()
  @KeepAlive(true)
  test(): Promise<Response> {
    return theTypes(Promise, Response)
  }
}

const apiTs: ApiTs = DrizzleBuilder.newBuilder()
  .baseUrl('http://localhost:3001/')
  .callFactory(FetchCallFactory.DEFAULT)
  .build()
  .create(ApiTs)
```

## Javascript

```javascript
class ApiJs {
  @GET('/')
  @ContentType('application/json;charset=utf-8')
  @CORS()
  @KeepAlive(true)
  test() {
    return theTypes(Promise, Response)
  }
}

constapiJs = DrizzleBuilder.newBuilder()
  .baseUrl('http://localhost:3001/')
  .callFactory(FetchCallFactory.DEFAULT)
  .build()
  .create(ApiJs)
```

### Minimum Babel Setup for Javascript

```
{
  "presets": ["@babel/preset-env"],
  "plugins": [
    "@babel/transform-runtime",
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-proposal-optional-chaining",
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    "babel-plugin-parameter-decorator",
    ["@babel/plugin-proposal-class-properties", { "loose": true }]
  ]
}
```

## Additional Decorators

| Decorator         | Description                                                      | Target |
| ----------------- | ---------------------------------------------------------------- | ------ |
| @Mode()           | Configure RequestInit.mode                                       | Method |
| @CORS()           | Set RequestInit.mode to 'cors'                                   | Method |
| @SameOrigin()     | Set RequestInit.mode to 'same-origin'                            | Method |
| @NoCORS()         | Set RequestInit.mode to 'no-cors'                                | Method |
| @Navigate()       | Set RequestInit.mode to 'navigate'                               | Method |
| @Cache()          | Configure RequestInit.cache. Parameter: RequestCache             | Method |
| @Credentials()    | Configure RequestInit.credentials. Parameter: RequestCredentials | Method |
| @Redirect()       | Configure RequestInit.redirect                                   | Method |
| @Referrer()       | Configure RequestInit.referrer                                   | Method |
| @ReferrerPolicy() | Configure RequestInit.referrerPolicy                             | Method |
| @KeepAlive()      | Configure RequestInit.keepAlive                                  | Method |
| @Integrity()      | Configure RequestInit.integrity                                  | Method |
| @Follow()         | Configure Node-Fetch **follow** option                           | Method |
| @Compress()       | Configure Node-Fetch **compress** option                         | Method |
| @Size()           | Configure Node-Fetch **size** option                             | Method |
