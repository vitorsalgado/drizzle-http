import {
  ResponseConverter,
  ResponseConverterFactory,
} from "../../../ResponseConverter.ts";
import { Drizzle } from "../../../Drizzle.ts";
import { RequestFactory } from "../../../RequestFactory.ts";
import { RawResponse } from "./RawResponse.ts";

export class RawResponseConverter implements ResponseConverter<Response> {
  static INSTANCE = new RawResponseConverter();

  convert(from: Response): Promise<Response> {
    return Promise.resolve(from);
  }
}

export class RawResponseConverterFactory implements ResponseConverterFactory {
  static INSTANCE = new RawResponseConverterFactory();

  provide(
    _drizzle: Drizzle,
    _responseType: string,
    requestFactory: RequestFactory,
  ): ResponseConverter<Response> | null {
    if (requestFactory.hasDecorator(RawResponse)) {
      return RawResponseConverter.INSTANCE;
    }

    return null;
  }
}
