export class DrizzleError extends Error {
  constructor(message: string, public readonly code = "DZ_ERR") {
    super(message);
    this.name = "DrizzleError";
    this.code = code;
  }
}
