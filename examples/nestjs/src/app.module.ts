import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { apiFactory } from './app.api.factory'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, apiFactory]
})
export class AppModule {}
