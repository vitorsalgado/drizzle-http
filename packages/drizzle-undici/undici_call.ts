import { Pool } from 'undici'
import { Call } from '@drizzle-http/core'
import { HttpRequest } from '@drizzle-http/core'
import { toUndiciRequest } from './to_undici_request.js'
import { UndiciResponse } from './undici_response.js'

export class UndiciCall implements Call<UndiciResponse> {
  constructor(private readonly client: Pool) {}

  execute(request: HttpRequest): Promise<UndiciResponse> {
    return this.client.request(toUndiciRequest(request)).then(res => new UndiciResponse(request.url, res))
  }
}
