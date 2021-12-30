import { DrizzleBuilder } from '@drizzle-http/core'
import { CircuitBreakerCallAdapterFactory } from '@drizzle-http/opossum-circuit-breaker'
import { MapCallAdapterFactory } from '@drizzle-http/response-mapper-adapter'
import { RxJsCallAdapterFactory } from '@drizzle-http/rxjs-adapter'
import { LoggingInterceptor } from '@drizzle-http/logging-interceptor'
import { Level } from '@drizzle-http/logging-interceptor'
import { UndiciCallFactory } from '@drizzle-http/undici'
import { PartyAPI } from './PartyAPI'

export function providePartyAPI(): PartyAPI {
  return DrizzleBuilder.newBuilder()
    .baseUrl('https://dadosabertos.camara.leg.br/api/v2/')
    .callFactory(new UndiciCallFactory())
    .addCallAdapterFactories(new CircuitBreakerCallAdapterFactory({}, new MapCallAdapterFactory()))
    .addCallAdapterFactories(new RxJsCallAdapterFactory())
    .addInterceptor(new LoggingInterceptor({ level: Level.BODY }))
    .build()
    .create(PartyAPI)
}
