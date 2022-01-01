import { DrizzleError } from "./internal/mod.ts";
import { HttpRequest } from "./HttpRequest.ts";

interface Res<B = unknown> {
  readonly ok: boolean;
  readonly headers: Headers;
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly body: B;
}

export class HttpError<B = unknown> extends DrizzleError {
  constructor(
    public readonly request: HttpRequest,
    public readonly response: Res<B>,
  ) {
    super(`Request failed with status code: ${response.status}`, "DZ_ERR_HTTP");

    Error.captureStackTrace(this, HttpError);

    this.name = "DzHttpError";
  }

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      code: this.code,
      url: this.response.url,
      status: this.response.status,
      stack: this.stack,
    };
  }

  toString() {
    return `HttpError{ url:${this.response.url}, status: ${this.response.status}, reason: ${this.message} }`;
  }
}
