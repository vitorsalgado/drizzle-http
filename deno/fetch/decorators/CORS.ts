import { Mode } from "./Mode.ts";
import { createClassAndMethodDecorator } from "../../ApiParameterization.ts";

export function CORS() {
  return createClassAndMethodDecorator(
    CORS,
    (defaults) => defaults.addConfig<RequestMode>(Mode.Key, "cors"),
    (requestFactory) => requestFactory.addConfig<RequestMode>(Mode.Key, "cors"),
  );
}
