export class DrizzleError extends Error {
  readonly code: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'Drizzle-Http.Error'
    this.code = code || 'DRIZZLE_HTTP_ERR'
  }
}
