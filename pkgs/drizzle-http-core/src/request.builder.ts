import { DzRequest } from './DzRequest'

/**
 * Builds a {@link Request} instance
 */
export interface RequestBuilder {
  toRequest(args: unknown[]): DzRequest
}
