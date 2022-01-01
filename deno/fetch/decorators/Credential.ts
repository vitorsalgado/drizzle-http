import { createClassAndMethodDecorator } from "../../ApiParameterization.ts";

export function Credentials(credentials: RequestCredentials) {
  return createClassAndMethodDecorator(
    Credentials,
    (defaults) => defaults.addConfig(Credentials.Key, credentials),
    (requestFactory) => requestFactory.addConfig(Credentials.Key, credentials),
  );
}

Credentials.Key = "fetch:credentials";
