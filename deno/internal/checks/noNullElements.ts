import { InvalidArgumentError } from './InvalidArgumentError.ts'
import { isNullOrUndefined } from './utils.ts'

export function noNullElements<K, V = unknown>(
  value: Array<K> | Map<K, V> | Set<K>,
  message: string = 'Collection argument must not be empty.'
): Array<K> | Map<K, V> | Set<K> {
  if (Array.isArray(value)) {
    if (value.some(isNullOrUndefined)) {
      throw new InvalidArgumentError(message)
    }
  }

  if (value instanceof Set) {
    for (const item of value.values()) {
      if (isNullOrUndefined(item)) {
        throw new InvalidArgumentError(message)
      }
    }
  }

  if (value instanceof Map) {
    for (const [k, v] of value.entries()) {
      if (isNullOrUndefined(k) || isNullOrUndefined(v)) {
        throw new InvalidArgumentError(message)
      }
    }
  }

  return value
}
