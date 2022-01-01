import { InvalidArgumentError } from "./InvalidArgumentError.ts";
import { isNullOrUndefined } from "./utils.ts";

export function notEmpty<K, V = unknown>(
  value: Array<K> | Map<K, V> | Set<K> | string,
  message = "Collection argument must not be null or empty.",
): Array<K> | Map<K, V> | Set<K> | string {
  if (isNullOrUndefined(value)) {
    throw new InvalidArgumentError(message);
  }

  if (typeof value === "string") {
    if (value.length === 0) {
      throw new InvalidArgumentError(
        "String argument must not be zero length.",
      );
    }
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      throw new InvalidArgumentError(message);
    }
  }

  if (value instanceof Set || value instanceof Map) {
    if (value.size === 0) {
      throw new InvalidArgumentError(message);
    }
  }

  return value;
}
