import { createClassAndMethodDecorator } from "../../ApiParameterization.ts";

export function Integrity(integrity: string) {
  return createClassAndMethodDecorator(
    Integrity,
    (defaults) => defaults.addConfig(Integrity.Key, integrity),
    (requestFactory) => requestFactory.addConfig(Integrity.Key, integrity),
  );
}

Integrity.Key = "fetch:integrity";
