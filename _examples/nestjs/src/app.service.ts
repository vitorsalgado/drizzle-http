import { Injectable } from '@nestjs/common'
import { PartiesAPI, Party } from './app.api'

@Injectable()
export class AppService {
  constructor(private readonly partiesApi: PartiesAPI) {}

  parties(acronym: string): Promise<Party[]> {
    return this.partiesApi.parties(acronym).then(response => response.dados)
  }
}
