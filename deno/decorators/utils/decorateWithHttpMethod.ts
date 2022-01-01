import { Metadata, setupRequestFactory } from "../../ApiParameterization.ts";
import {
  AnyClass,
  Decorator,
  isFunction,
  notNull,
  TargetProto,
} from "../../internal/mod.ts";

/**
 * Configure a method to perform an HTTP request
 *
 * @param decorator - method decorator
 * @param httpMethod - HTTP verb of the request
 * @param path - request path that will be concatenated with the base url
 */
export function decorateWithHttpMethod(
  decorator: Decorator,
  httpMethod: string,
  path: string,
) {
  isFunction(decorator);
  notNull(httpMethod);
  notNull(path);

  return function (
    target: TargetProto,
    method: string,
    descriptor: PropertyDescriptor,
  ) {
    Metadata.registerApiMethod(target.constructor, method);

    setupRequestFactory(decorator, target, method, (requestFactory) => {
      requestFactory.apiType = target.constructor as AnyClass;
      requestFactory.method = method;
      requestFactory.path = path.trim();
      requestFactory.httpMethod = httpMethod.toUpperCase();
      requestFactory.argLen = descriptor.value.length;

      descriptor.value = (...args: unknown[]) =>
        requestFactory.invoker()?.(...args);
    });
  };
}
