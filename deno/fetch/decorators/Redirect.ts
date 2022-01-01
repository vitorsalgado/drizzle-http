import { createClassAndMethodDecorator } from "../../ApiParameterization.ts";

export function Redirect(redirect: RequestRedirect) {
  return createClassAndMethodDecorator(
    Redirect,
    (defaults) => defaults.addConfig(Redirect.Key, redirect),
    (requestFactory) => requestFactory.addConfig(Redirect.Key, redirect),
  );
}

Redirect.Key = "fetch:redirect";
