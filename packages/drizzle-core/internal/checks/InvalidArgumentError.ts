export class InvalidArgumentError extends Error {
  constructor(message: string = 'Invalid argument.') {
    super(message)
  }
}
