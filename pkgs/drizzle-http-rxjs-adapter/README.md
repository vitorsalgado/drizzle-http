# RxJs Call Adapter &middot; [![ci](https://github.com/vitorsalgado/drizzle-http/workflows/ci/badge.svg)](https://github.com/vitorsalgado/drizzle-http/actions) [![npm (scoped)](https://img.shields.io/npm/v/@drizzle-http/rxjs-adapter)](https://www.npmjs.com/package/@drizzle-http/rxjs-adapter) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/vitorsalgado/drizzle-http/blob/main/LICENSE)

[RxJs](https://rxjs-dev.firebaseapp.com/) call adapter implementation for Drizzle-HTTP.

## Installation

The main package, [Drizzle-Http](https://www.npmjs.com/package/drizzle-http), already contains this module.  
If you are installing each package individually, make sure to install
first [@Drizzle-Http/core](https://www.npmjs.com/package/@drizzle-http/core) with: `npm i @drizzle-http/core`

### NPM

```
npm i @drizzle-http/rxjs-adapter
```

### Yarn

```
yarn add @drizzle-http/rxjs-adapter
```

## Usage

```typescript
class API {
  @GET('/{id}/projects')
  @RxJs()
  getRx(@Path('id') id: string): Observable<TestResult<TestId>> {
    return theTypes(Observable, TestResult)
  }
}

const api = DrizzleBuilder.newBuilder()
  .baseUrl(addr)
  .addCallAdapterFactories(RxJsCallAdapterFactory.DEFAULT)
  .build()
  .create(API)
```

There are 3 things you need to do in order to enable **RxJs** return type for you API calls:

- Add **RxJsCallAdapterFactory** to your **Drizzle** instance.
- Your method return type must be: **Observable\<V\>**. Import the Observable from RxJs.
- Add: **return theTypes(Observable)** in the method body. This way, Drizzle knows the return handledType during the
  setup and can set the **RxJsCallAdapter** for the request.  
  If you don't want to use the **theTypes(..)** function, use the decorator **@RxJs()** on the method. It's the same.
