import { Decorator, TargetCtor, TargetProto } from "../../internal/mod.ts";
import {
  createClassDecorator,
  createMethodDecorator,
} from "../../ApiParameterization.ts";

export const createRequestAndResponseTypes = (
  type: string,
  decorator: Decorator,
  request = true,
  response = true,
) => {
  return function (
    target: TargetProto | TargetCtor,
    method?: string,
    descriptor?: PropertyDescriptor,
  ) {
    if (method && descriptor) {
      return createMethodDecorator(decorator, (ctx) => {
        if (request) {
          ctx.requestFactory.requestType = type;
        }

        if (response) {
          ctx.requestFactory.responseType = type;
        }
      })(target, method, descriptor);
    }

    createClassDecorator(decorator, (ctx) => {
      if (request) {
        ctx.defaults.requestType = type;
      }

      if (response) {
        ctx.defaults.responseType = type;
      }
    })(target as TargetCtor);
  };
};
