import { Chain } from "./Chain.ts";
import { Drizzle } from "./Drizzle.ts";
import { RequestFactory } from "./RequestFactory.ts";

export interface Interceptor {
  intercept(chain: Chain): Promise<Response>;
}

export interface InterceptorFunction {
  (chain: Chain): Promise<Response>;
}

export interface InterceptorFactory {
  provide(drizzle: Drizzle, requestFactory: RequestFactory): Interceptor | null;
}
