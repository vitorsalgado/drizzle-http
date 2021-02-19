# Fetch Client for Drizzle-HTTP

![CI](https://github.com/vitorsalgado/drizzle-http/workflows/CI/badge.svg)

Fetch based HTTP client implementation for Drizzle-HTTP.  
This library contains several decorators to facilitate the definition of some request parameters for Fetch. See list
below.

By default, responses with error status code will be returned on `then()`.

## Installation

### NPM

```
npm i @drizzle-http/core
npm i @drizzle-http/fetch
```

### Yarn

```
yarn add @drizzle-http/core
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
  @KeepAlive(true) test() {
    return theTypes(Promise, Response)
  }

  const
  apiJs = DrizzleBuilder.newBuilder()
    .baseUrl('http://localhost:3001/')
    .callFactory(FetchCallFactory.DEFAULT)
    .build()
    .create(ApiJs)
}

```

### Minimum Babel Setup

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

| Decorator      | Description | Target |
| -------------- | ----------- | ------ |
| @Mode()         | Configure RequestInit.mode       | Method | 
| @CORS()         | Set RequestInit.mode to 'cors'      | Method | 
| @SameOrigin()         | Set RequestInit.mode to 'same-origin'      | Method |
| @NoCORS()         | Set RequestInit.mode to 'no-cors'      | Method |
| @Navigate()         | Set RequestInit.mode to 'navigate'      | Method |
| @Cache()         | Configure RequestInit.cache. Parameter: RequestCache      | Method |
| @Credentials()         | Configure RequestInit.credentials. Parameter: RequestCredentials     | Method |
| @Redirect()         | Configure RequestInit.redirect      | Method |
| @Referrer()         | Configure RequestInit.referrer      | Method |
| @ReferrerPolicy()         | Configure RequestInit.referrerPolicy      | Method |
| @KeepAlive()         | Configure RequestInit.keepAlive      | Method |
| @Integrity()         | Configure RequestInit.integrity      | Method |

