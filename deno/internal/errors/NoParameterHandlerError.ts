import { DrizzleError } from "./DrizzleError.ts";

export class NoParameterHandlerError extends DrizzleError {
  constructor(
    public readonly type: string,
    public readonly method: string,
    public readonly index: number,
  ) {
    super(
      `Type "${type}" does not have a parameter handler associated. Check method "${method}", decorated parameter [${index}].`,
      "DZ_ERR_NO_PARAMETER_HANDLER_FOR_TYPE",
    );

    this.name = "NoParameterHandlerFoundForType";
    this.stack = new Error().stack;
  }
}
