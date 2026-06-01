import { PartiesAPI } from './app.api'
import { DrizzleBuilder } from '@drizzle-http/core'
import { UndiciCallFactory } from '@drizzle-http/undici'

export const apiFactory = {
  provide: PartiesAPI,
  useFactory: () =>
    DrizzleBuilder.newBuilder()
      .baseUrl('https://dadosabertos.camara.leg.br/api/v2/')
      .callFactory(new UndiciCallFactory())
      .build()
      .create(PartiesAPI),
  inject: []
}
