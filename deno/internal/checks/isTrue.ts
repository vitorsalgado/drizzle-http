import { InvalidArgumentError } from "./InvalidArgumentError.ts";

export function isTrue(
  condition: boolean,
  message = "Argument does not meet required condition.",
) {
  if (!condition) {
    throw new InvalidArgumentError(message);
  }
}
