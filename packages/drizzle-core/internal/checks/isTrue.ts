import { InvalidArgumentError } from './InvalidArgumentError.js'

export function isTrue(condition: boolean, message = 'Argument does not meet required condition.'): void {
  if (!condition) {
    throw new InvalidArgumentError(message)
  }
}
