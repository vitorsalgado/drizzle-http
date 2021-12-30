import { InvalidArgumentError } from './InvalidArgumentError.ts'

export function isTrue(condition: boolean, message: string = 'Argument does not meet required condition.'): void {
  if (!condition) {
    throw new InvalidArgumentError(message)
  }
}
