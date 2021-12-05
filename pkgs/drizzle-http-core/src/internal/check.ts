import { DrizzleError } from './errors'

export class Check {
  /**
   * Throws an {@link DrizzleError} if parameter value is null or undefined
   *
   * @param value - value to be validated
   * @param message - error message
   *
   * @throws {@link DrizzleError}
   */
  static nullOrUndefined(value: unknown, message: string): void {
    if (value === null || typeof value === 'undefined') {
      throw new DrizzleError(message)
    }
  }

  static emptyStr(value: string, message: string): void {
    if (!value) {
      throw new DrizzleError(message)
    }
  }
}

export const C = Check
