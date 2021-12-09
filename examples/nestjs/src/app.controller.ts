import { Controller, Get } from '@nestjs/common'
import { Query } from '@nestjs/common'
import { AppService } from './app.service'
import { Party } from './app.api'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Query('acronym') acronym: string): Promise<Party[]> {
    return this.appService.parties(acronym)
  }
}
