import { BodyType } from "./BodyType.ts";

interface HttpRequestInit {
  url: string;
  method: string;
  headers: Headers;
  body: BodyType;
  headersTimeout?: number;
  bodyTimeout?: number;
  signal: unknown;
}

export class HttpRequest {
  public readonly url: string;
  public readonly method: string;
  public readonly headers: Headers;
  public readonly body: BodyType;
  public readonly headersTimeout?: number;
  public readonly bodyTimeout?: number;
  public readonly signal?: unknown;

  constructor(init: HttpRequestInit) {
    this.url = init.url;
    this.method = init.method;
    this.headers = init.headers;
    this.body = init.body;
    this.headersTimeout = init.headersTimeout;
    this.bodyTimeout = init.bodyTimeout;
    this.signal = init.signal;
  }
}
