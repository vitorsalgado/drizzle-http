import { Call, CallFactory } from "../Call.ts";
import { RequestFactory } from "../RequestFactory.ts";
import { Drizzle } from "../Drizzle.ts";
import { Metadata } from "../ApiParameterization.ts";
import { DenoCall } from "./DenoCall.ts";
import {
  Cache,
  Credentials,
  Integrity,
  KeepAlive,
  Mode,
  Redirect,
  Referrer,
  ReferrerPolicy,
} from "./decorators/mod.ts";

export class DenoCallFactory implements CallFactory {
  static DEFAULT = new DenoCallFactory({});

  constructor(private readonly options: RequestInit = {}) {
  }

  setup() {
    // no setup needed
  }

  provide(drizzle: Drizzle, requestFactory: RequestFactory): Call {
    const defaults = Metadata.apiDefaults(requestFactory.apiOwner());
    const def: RequestInit = {
      cache: defaults.getConfig(Cache.Key),
      mode: defaults.getConfig(Mode.Key),
      credentials: defaults.getConfig(Credentials.Key),
      integrity: defaults.getConfig(Integrity.Key),
      keepalive: defaults.getConfig(KeepAlive.Key),
      redirect: defaults.getConfig(Redirect.Key),
      referrer: defaults.getConfig(Referrer.Key),
      referrerPolicy: defaults.getConfig(ReferrerPolicy.Key),
    };

    const req: RequestInit = {
      cache: requestFactory.getConfig(Cache.Key),
      mode: requestFactory.getConfig(Mode.Key),
      credentials: requestFactory.getConfig(Credentials.Key),
      integrity: requestFactory.getConfig(Integrity.Key),
      keepalive: requestFactory.getConfig(KeepAlive.Key),
      redirect: requestFactory.getConfig(Redirect.Key),
      referrer: requestFactory.getConfig(Referrer.Key),
      referrerPolicy: requestFactory.getConfig(ReferrerPolicy.Key),
    };

    return new DenoCall(new URL(drizzle.baseUrl()), {
      ...this.options,
      ...def,
      ...req,
    });
  }
}
