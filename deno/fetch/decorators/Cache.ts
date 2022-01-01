import { createClassAndMethodDecorator } from "../../ApiParameterization.ts";

export function Cache(cache: RequestCache) {
  return createClassAndMethodDecorator(
    Cache,
    (defaults) => defaults.addConfig(Cache.Key, cache),
    (requestFactory) => requestFactory.addConfig(Cache.Key, cache),
  );
}

Cache.Key = "fetch:cache";
