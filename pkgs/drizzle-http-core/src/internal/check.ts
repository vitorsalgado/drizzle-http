import { DrizzleError } from './errors'

export class Check {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {
  }

  /**
   * Throws an {@link DrizzleError} if parameter value is null or undefined
   *
   * @param value - value to be validated
   * @param message - error message
   *
   * @throws {@link DrizzleError}
   */
  static nullOrUndefined(value: any, message: string): void {
    if (value === null || typeof value === 'undefined') {
      throw new DrizzleError(message)
    }
  }

  static emptyStr(value: string, message: string): void {
    if (!value) {
      throw new DrizzleError(message)
    }
  }

  static checkIf(fn: (() => boolean) | boolean, error: Error): void {
    if (typeof fn === 'function') {
      if (!fn()) {
        throw error
      }

      return
    }

    if (!fn) {
      throw error
    }
  }
}

export const C = Check
