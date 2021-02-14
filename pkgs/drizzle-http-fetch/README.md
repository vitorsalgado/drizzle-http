# Fetch Client for Drizzle-HTTP

![CI](https://github.com/vitorsalgado/drizzle-http/workflows/CI/badge.svg)

Fetch based HTTP client implementation for Drizzle-HTTP.  
This library contains several decorators to facilitate the definition of some request parameters for Fetch. See list
below.

By default, responses with error status code will be returned on `then()`.

## Installation

```
npm i @drizzle-http/core
npm i @drizzle-http/fetch
```

## Usage

### Typescript

```
class ApiTs {
  @GET('/')
  @ContentType('application/json;charset=utf-8')
  @CORS()
  @KeepAlive(true)
  test(): Promise<Response> {
    return theTypes(Promise, Response)
  }
}

const apiTs: ApiTs = Drizzle.builder()
  .baseUrl('http://localhost:3001/')
  .callFactory(FetchCallFactory.DEFAULT)
  .build()
  .create(ApiTs)
```

## Javascript

```
class ApiJs {
  @GET('/')
  @ContentType('application/json;charset=utf-8')
  @CORS()
  @KeepAlive(true)
  test () {
    return theTypes(Promise, Response)
  }
  
const apiJs = Drizzle.builder()
  .baseUrl('http://localhost:3001/')
  .callFactory(FetchCallFactory.DEFAULT)
  .build()
  .create(ApiJs)
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
