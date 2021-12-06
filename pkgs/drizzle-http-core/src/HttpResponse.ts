import { HttpHeaders } from './HttpHeaders'
import { BodyType } from './internal'

/**
 * Minimum contract that every response should follow inside the framework
 */
export interface HttpResponse<BLOB = unknown, FORM_DATA = unknown, HEADERS = HttpHeaders> {
  readonly headers: HEADERS
  readonly status: number
  readonly statusText: string
  readonly url: string
  readonly body: BodyType

  get ok(): boolean

  get bodyUsed(): boolean

  arrayBuffer(): Promise<ArrayBuffer>

  json<T>(): Promise<T>

  text(): Promise<string>

  blob(): Promise<BLOB>

  formData(): Promise<FORM_DATA>
}

/**
 * Check if status code is within 200 and 299
 *
 * @param statusCode - response numeric status code
 */
export function isOK(statusCode: number): boolean {
  return statusCode >= 200 && statusCode <= 299
}
