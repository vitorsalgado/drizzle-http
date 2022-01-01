import { InvalidArgumentError } from './InvalidArgumentError'

export function isTrue(condition: boolean, message = 'Argument does not meet required condition.'): void {
  if (!condition) {
    throw new InvalidArgumentError(message)
  }
}
