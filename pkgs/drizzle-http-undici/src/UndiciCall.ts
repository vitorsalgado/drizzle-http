import { Pool } from 'undici'
import { Call } from '@drizzle-http/core'
import { HttpError } from '@drizzle-http/core'
import { HttpRequest } from '@drizzle-http/core'
import { toUndiciRequest } from './toUndiciRequest'
import { UndiciResponse } from './UndiciResponse'

export class UndiciCall extends Call<Promise<UndiciResponse>> {
  constructor(private readonly client: Pool, request: HttpRequest, argv: unknown[]) {
    super(request, argv)
  }

  execute(): Promise<UndiciResponse> {
    return this.client
      .request(toUndiciRequest(this.request))
      .then(res => new UndiciResponse(this.request.url, res))
      .then(response => {
        if (!response.ok) {
          throw new HttpError(this.request, response)
        }

        return response
      })
  }
}
