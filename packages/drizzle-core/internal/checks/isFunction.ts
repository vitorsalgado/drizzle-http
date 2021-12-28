export function isFunction(fn: unknown, message: string = 'Argument must be a function type.'): void {
  if (typeof fn !== 'function') {
    throw new Error(message)
  }
}
