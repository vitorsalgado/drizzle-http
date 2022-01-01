export function isFunction(fn: unknown, message = 'Argument must be a function type.'): void {
  if (typeof fn !== 'function') {
    throw new Error(message)
  }
}
