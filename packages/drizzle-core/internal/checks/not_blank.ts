import { InvalidArgumentError } from './invalid_argument_error.js'
import { isNullOrUndefined } from './utils.js'

export function notBlank(value: string, message = 'String must not be blank.'): string {
  if (isNullOrUndefined(value) || value.trim().length === 0) {
    throw new InvalidArgumentError(message)
  }

  return value
}
