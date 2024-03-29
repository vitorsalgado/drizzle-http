export function oneOf<T>(
  value: T,
  args: unknown[],
  message = 'Value must be contained in the accepted values list.'
): T {
  if (args.some(arg => arg === value)) {
    return value
  }

  throw new Error(message)
}
