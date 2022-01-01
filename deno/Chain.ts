import { HttpRequest } from "./HttpRequest.ts";
import { RequestFactory } from "./RequestFactory.ts";

export interface Chain {
  requestFactory(): RequestFactory;

  method(): string;

  request(): HttpRequest;

  argv(): unknown[];

  proceed(request: HttpRequest): Promise<Response>;
}
