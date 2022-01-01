// deno-lint-ignore-file no-unused-vars

import {
  ResponseHandler,
  ResponseHandlerFactory,
} from "../../../ResponseHandler.ts";
import { HttpRequest } from "../../../HttpRequest.ts";
import { Drizzle } from "../../../Drizzle.ts";
import { RequestFactory } from "../../../RequestFactory.ts";
import { RawResponse } from "./RawResponse.ts";

export class RawResponseHandler implements ResponseHandler {
  static INSTANCE = new RawResponseHandler();

  handle(
    argv: unknown[],
    request: HttpRequest,
    response: Response,
  ): Promise<Response> {
    return Promise.resolve(response);
  }
}

export class RawResponseHandlerFactory implements ResponseHandlerFactory {
  provide(
    drizzle: Drizzle,
    requestFactory: RequestFactory,
  ): ResponseHandler | null {
    if (requestFactory.hasDecorator(RawResponse)) {
      return RawResponseHandler.INSTANCE;
    }

    return null;
  }
}
