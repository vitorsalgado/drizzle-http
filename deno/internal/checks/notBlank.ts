import { InvalidArgumentError } from "./InvalidArgumentError.ts";
import { isNullOrUndefined } from "./utils.ts";

export function notBlank(
  value: string,
  message = "String must not be blank.",
) {
  if (isNullOrUndefined(value) || value.trim().length === 0) {
    throw new InvalidArgumentError(message);
  }

  return value;
}
