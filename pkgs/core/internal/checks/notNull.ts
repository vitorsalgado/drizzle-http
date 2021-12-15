import { InvalidArgumentError } from './InvalidArgumentError'

export function notNull<T>(value: T, message: string = 'Argument must not be null or undefined.'): T {
  if (value === null || typeof value === 'undefined') {
    throw new InvalidArgumentError(message)
  }

  return value
}
