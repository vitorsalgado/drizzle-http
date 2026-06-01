import { InvalidArgumentError } from './InvalidArgumentError.js'

export function notNull<T>(value: T, message = 'Argument must not be null or undefined.'): NonNullable<T> {
  if (value === null || typeof value === 'undefined') {
    throw new InvalidArgumentError(message)
  }

  return value as NonNullable<T>
}
