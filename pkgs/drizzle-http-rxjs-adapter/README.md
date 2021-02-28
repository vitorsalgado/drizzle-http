# RxJs Call Adapter

![ci](https://github.com/vitorsalgado/drizzle-http/workflows/ci/badge.svg)

[RxJs](https://rxjs-dev.firebaseapp.com/) call adapter implementation for Drizzle-HTTP.

## Installation

The main package, _**drizzle-http**_, already contains this module.  
To install it individually, use:

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
