import { InvalidArgumentError } from './invalid_argument_error.js'

export function isTrue(condition: boolean, message = 'Argument does not meet required condition.'): void {
  if (!condition) {
    throw new InvalidArgumentError(message)
  }
}
