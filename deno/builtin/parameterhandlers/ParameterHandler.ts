import { RequestParameterization } from "../../RequestParameterization.ts";

export interface ParameterHandler<V = unknown> {
  handle(requestValues: RequestParameterization, value: V): void;
}
