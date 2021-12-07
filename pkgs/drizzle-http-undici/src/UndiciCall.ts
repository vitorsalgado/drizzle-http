import { Pool } from 'undici'
import { Call } from '@drizzle-http/core'
import { HttpRequest } from '@drizzle-http/core'
import { toUndiciRequest } from './toUndiciRequest'
import { UndiciResponse } from './UndiciResponse'

export class UndiciCall implements Call<Promise<UndiciResponse>> {
  constructor(private readonly client: Pool, readonly request: HttpRequest, readonly argv: unknown[]) {}

  execute(): Promise<UndiciResponse> {
    return this.client.request(toUndiciRequest(this.request)).then(res => new UndiciResponse(this.request.url, res))
  }
}
