<a href="https://github.com/vitorsalgado/drizzle-http" target="_blank"><img src="assets/drizzle.png" alt="Drizzle HTTP Logo"  width="140px" align="right" /></a>

# Getting Started

## Basics

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

### Browser Decorators (for Fetch)

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
