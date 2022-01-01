import { Interceptor } from "./Interceptor.ts";
import { Chain } from "./Chain.ts";
import { Call } from "./Call.ts";

export class InterceptorHttpExecutor implements Interceptor {
  constructor(private readonly call: Call) {}

  intercept(chain: Chain) {
    return this.call.execute(chain.request(), chain.argv());
  }
}
