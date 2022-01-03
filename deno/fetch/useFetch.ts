import { MultipartRequestBodyConverterFactory } from "./MultipartRequestBodyConverter.ts";
import { PartParameterHandlerFactory } from "./MultipartParameterHandler.ts";
import { DrizzleBuilder } from "../DrizzleBuilder.ts";
import { DenoCallFactory } from "./DenoCallFactory.ts";

export function useFetch() {
  return function (drizzleBuilder: DrizzleBuilder): void {
    drizzleBuilder.callFactory(new DenoCallFactory());
    drizzleBuilder.addParameterHandlerFactory(
      new PartParameterHandlerFactory(),
    );
    drizzleBuilder.addRequestConverterFactories(
      new MultipartRequestBodyConverterFactory(),
    );
  };
}
