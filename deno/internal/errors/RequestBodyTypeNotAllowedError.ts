import { DrizzleError } from "./DrizzleError.ts";

export class RequestBodyTypeNotAllowedError extends DrizzleError {
  constructor(public readonly method: string, message: string) {
    super(message, "DZ_ERR_REQUEST_BODY_TYPE_NOT_ALLOWED");

    this.name = "RequestBodyTypeNotAllowed";
    this.stack = new Error().stack;
  }
}
