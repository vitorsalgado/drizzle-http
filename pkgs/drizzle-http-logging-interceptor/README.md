# Logging Interceptor

![CI](https://github.com/vitorsalgado/drizzle-http/workflows/CI/badge.svg)

Drizzle-HTTP interceptor that logs HTTP requests and responses.  
The default Logger implementation uses [Pino](https://getpino.io/).

## Installation

```
npm i @drizzle-http/core
npm i @drizzle-http/logging-interceptor
```

## Usage

### Default Implementation

```
const api = Drizzle.builder()
  .baseUrl(address)
  .callFactory(UndiciCallFactory.DEFAULT)
  .addInterceptor(interceptor)
  .build()
  .create(API)
```

### Customize

```
const interceptor = new LoggingInterceptor(fake, Level.BODY)
interceptor.redactHeader('x-super-secret-header')
interceptor.redactHeaders(['x-other-secret-header', 'x-one-more-secret-header'])
    
const api = Drizzle.builder()
  .baseUrl(address)
  .callFactory(UndiciCallFactory.DEFAULT)
  .addInterceptor(interceptor)
  .build()
  .create(API)
```

## Features

You can change the level using the following values: `NONE, BASIC, HEADERS, BODY`.  
To customize the default Pino implementation, provide a custom instance of **PinoLogger**. E.g.:

```
const customPinoLogger = new PinoLogger({ // pino.LoggerOptions })

const api = Drizzle.builder()
  .baseUrl(address)
  .callFactory(UndiciCallFactory.DEFAULT)
  .addInterceptor(new LoggingInterceptor(customPinoLogger))
  .build()
  .create(API)
```

To avoid logging sensitive information on Headers, use:

```
loggingInterceptor.redactHeader('secret-header')
```
