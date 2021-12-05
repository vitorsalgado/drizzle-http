import { InvalidArgumentError } from './InvalidArgumentError'
import { isNullOrUndefined } from './utils'

export function notBlank(value: string, message = 'String must not be blank.'): string {
  if (isNullOrUndefined(value) || value.trim().length === 0) {
    throw new InvalidArgumentError(message)
  }

  return value
}
