// deno-lint-ignore-file no-unused-vars

import { RequestFactory } from "./RequestFactory.ts";
import { Drizzle } from "./Drizzle.ts";
import { HttpError } from "./HttpError.ts";
import { HttpRequest } from "./HttpRequest.ts";
import { ResponseConverter } from "./ResponseConverter.ts";

/**
 * Handles a {@link Response}.
 */
export interface ResponseHandler {
  handle(
    argv: unknown[],
    request: HttpRequest,
    response: Response,
  ): Promise<Response>;
}

/**
 * Builds a {@link ResponseHandler} instance.
 */
export interface ResponseHandlerFactory {
  provide(
    drizzle: Drizzle,
    requestFactory: RequestFactory,
  ): ResponseHandler | null;
}

/**
 * Default {@link ResponseHandler} implementation.
 * If response is not ok, it throws an {@link HttpError}.
 * When decorated with {@link RawResponse}, this response handler will be ignored and the response will be passed as is.
 */
export class DefaultResponseHandler implements ResponseHandler {
  constructor(
    private readonly convertErrorBody: boolean,
    private readonly responseConverter: ResponseConverter<unknown>,
  ) {
  }

  /**
   * Handles the HTTP response and throws an error if status code is not success.
   *
   * @param argv - api method arguments collection
   * @param request - request instance
   * @param response - actual HTTP response
   *
   * @throws HttpError
   * @returns Promise<Response>
   */
  async handle(
    argv: unknown[],
    request: HttpRequest,
    response: Response,
  ): Promise<Response> {
    if (response.ok) {
      return response;
    }

    let body: unknown = null;

    if (this.convertErrorBody) {
      if (!response.bodyUsed) {
        body = await this.responseConverter.convert(response);
      }
    } else {
      if (
        !response.bodyUsed && response.body &&
        response.body instanceof ReadableStream
      ) {
        if (!response.bodyUsed && response.body) {
          try {
            body = await response.text();
          } finally {
            // no need to catch error here
          }
        }
      }
    }

    throw new HttpError(request, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      body,
    });
  }
}

/**
 * Empty {@link ResponseHandler} implementation.
 * Used when {@link Response} should be returned as is.
 */
export class NoopResponseHandler implements ResponseHandler {
  static INSTANCE = new NoopResponseHandler();

  handle(
    argv: unknown[],
    request: HttpRequest,
    response: Response,
  ): Promise<Response> {
    return Promise.resolve(response);
  }
}
