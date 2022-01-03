<h1 align='center'>Drizzle HTTP &middot; Deno</h1>

<p align='center'>
  <img src="./logo.png" alt="Repository Logo" width='100px' height='100px' />
  <br />
  <i>Create API Clients with <strong>Decorators</strong> for Typescript and Javascript.</i>
</p>

<p align='center'>
  <a href='https://www.npmjs.com/settings/drizzle-http/packages' target='_blank'><strong>NPM Packages</strong></a><br/>
  <a href='https://deno.land/x/drizzle_http' target='_blank'><strong>Deno</strong></a><br/>
</p>

<p align='center'>
  <a href="https://github.com/vitorsalgado/drizzle-http/actions/workflows/deno.yml">
    <img src="https://github.com/vitorsalgado/drizzle-http/actions/workflows/deno.yml/badge.svg" alt="Deno GitHub Action Status" />
  </a>
  <a href="https://deno.land/x/drizzle_http">
    <img src="https://img.shields.io/badge/available%20on-deno.land-lightgrey?logo=deno&labelColor=black" alt="Deno Package"/>
  </a>
  <a href="https://doc.deno.land/https://deno.land/x/drizzle_http@v3.1.0/mod.ts">
    <img src="https://doc.deno.land/badge.svg" alt="Deno Doc"/>
  </a>
  <a href="https://conventionalcommits.org">
    <img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-blue.svg?logo=git" alt="Conventional Commits"/>
  </a>
</p>

---

## What it is

**Drizzle-HTTP** is library inspired by
[Retrofit](https://github.com/square/retrofit) and
[Feign](https://github.com/OpenFeign/feign), that let you create API clients
using **decorators**.

## Getting Started

By default, request and response bodies will be handled as JSON. Will can change
this with the appropriate decorators.\
It will not set the content type by default.

### Overview

Usage typically looks like the example below:

```typescript
@Timeout(15e30)
@Path("/customers")
class CustomerAPI {
  @GET()
  search(
    @Query("filter") filter: string,
    @Query("sort") sort: string,
  ): Promise<Customer[]> {
  }

  @GET("/{id}")
  @ParseErrorBody()
  byId(@Param("id") id: string): Promise<Customer> {
  }

  @POST()
  add(@Body() customer: Customer): Promise<HttpResponse> {
  }

  @PUT("/{id}")
  update(
    @Param("id") id: string,
    @Body() customer: Customer,
  ): Promise<HttpResponse> {
  }

  @DELETE("/{id}")
  remove(@Param("id") id: string): Promise<HttpResponse> {
  }

  @POST("/{id}/docs")
  @Multipart()
  sendDoc(@Part() desc: string, @Part() doc: File): Promise<Response> {
  }
}

const api = newAPI()
  .baseUrl("https://example.com")
  .configurer(useFetch())
  .createAPI(CustomerAPI);

const customer = await api.byId("100");
```

<!---
// @formatter:off
-->

## Basic Decorators

| Decorator             | Description                                                                                    | Target                     |
| --------------------- | ---------------------------------------------------------------------------------------------- | -------------------------- |
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

## Fetch Specific Decorators

| Decorator         | Description                                                      | Target        |
| ----------------- | ---------------------------------------------------------------- | ------------- |
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

### Defaults

Default values that Drizzle starts with. All values can be overridden using
decorators.

- Timeout: **30 seconds**
- Request Body Converter: **JSON**
- Response Body Converter: **JSON**

### Error Handling

When methods are not decorated with `@RawResponse()`, Drizzle throws an
`HttpError` with the following structure:

```
{
  message: 'Request failed with status code: 400',
  code: 'DZ_ERR_HTTP',
  request: {
    url: 'https://example.com/test,
    method: 'GET',
    headers: Headers,
    body: ''
  },
  response: {
    headers: Headers,
    status: 400,
    statusText: ''
    body: 'error from server'
  }
}
```

When you want to parse the error response body to, for example a JSON object,
use `@ParseErrorBody()`. By default, @ParseErrorBody() use the same response
converter used by the success scenario. If you need a different converter for
the error body, pass the name of the converter to the decorator. E.g.:
`@ParseErrorBody(BuiltInConv.TEXT)`.

## Features

### Raw Fetch Response

By the default, http success responses you be parsed and resolved and http
errors will be rejected. If you want the raw Fetch http response, decorate your
method with `@RawResponse()` and the return will be a `Promise<Response>`, same
as Fetch. In this case, http errors will be not rejected.

### Multi Part

`multipart/form-data` requests are only available on browsers.\
To enable it, add the following components to an api builder instance:

```typescript
newAPI()
  .addParameterHandlerFactory(new MultipartParameterHandler())
  .addRequestConverterFactories(new MultipartRequestBodyConverterFactory());
//// Other configurations ...
```

Now, to make a `multipart/form-data` request, decorate your method with
`@Multipart()`. Use the decorator `@Part()` to mark a parameter as an entry in a
FormData object. You can also send a `@Body()` parameter with a `File`,
`File[]`, `FormData` or an `HTML Form`.

### Interceptors

You can intercept requests and responses using
[Interceptors](packages/drizzle-core/Interceptor.ts).\
You can a simple function, `chain => {}`, an `Intepcetor` interface
implementation or an `InterceptorFactory` implementation, if you need more
configurations.\
Take a look on the examples below:

```typescript
class CustomerAPI {
  @GET("/{id}")
  getById(@Param("id") id: string): Promise<Customer> {
    return noop(id);
  }
}

const api = newAPI()
  .addInterceptor(async (chain) => {
    console.log("before request");

    const response = await chain.proceed(chain.request());

    console.log("after request");

    return response;
  })
  .baseUrl("https://example.com")
  .callFactory(new UndiciCallFactory())
  .createAPI(CustomerAPI);
```
