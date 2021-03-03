export class DrizzleError extends Error {
  readonly code: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'Drizzle-Http.Error'
    this.code = code || 'DRIZZLE_HTTP_ERR'
  }
}

export class PrematureServerResponseCloseError extends DrizzleError {
  constructor() {
    super('Premature server response close', 'DRIZZLE_HTTP_ERR_PREMATURE_RESP_CLOSE')
    Error.captureStackTrace(this, PrematureServerResponseCloseError)
    this.name = 'PrematureServerResponseCloseError'
  }
}

export class InvalidRequestMethodConfigurationError extends DrizzleError {
  constructor(public method: string, message: string) {
    super(
      `Method "${method === null || typeof method === 'undefined' ? '' : method}" contains invalid configuration(s): ` +
        message,
      'DRIZZLE_HTTP_ERR_INVALID_REQ_METHOD_CONFIG'
    )
    Error.captureStackTrace(this, InvalidRequestMethodConfigurationError)
    this.name = 'InvalidRequestMethodConfigurationError'
  }
}

export class RequestBodyTypeNotAllowed extends DrizzleError {
  constructor(public method: string, message: string) {
    super(message, 'DRIZZLE_HTTP_ERR_REQUEST_BODY_TYPE_NOT_ALLOWED')
    Error.captureStackTrace(this, RequestBodyTypeNotAllowed)
    this.name = 'RequestBodyTypeNotAllowed'
  }
}

export class NoRequestConverterError extends DrizzleError {
  constructor(method: string) {
    super(`No Request Converter found for ${method}`, 'DRIZZLE_HTTP_ERR_NO_REQUEST_CONVERTER')
    Error.captureStackTrace(this, NoRequestConverterError)
    this.name = 'NoRequestConverterError'
  }
}

export class MethodNotSupportedError extends DrizzleError {
  constructor(method: string) {
    super(`Method ${method} is not supported by Drizzle ${method}`, 'DRIZZLE_HTTP_ERR_METHOD_NOT_SUPPORTED')
    Error.captureStackTrace(this, MethodNotSupportedError)
    this.name = 'MethodNotSupportedError'
  }
}

export class NoParameterHandlerFoundForType extends DrizzleError {
  constructor(type: string, method: string, index: number) {
    super(
      `Type "${type}" does not have a parameter handler associated. Check method "${method}", decorated parameter [${index}].`,
      'DRIZZLE_HTTP_ERR_PARAMETER_HANDLER_NOT_FOUND'
    )
    Error.captureStackTrace(this, NoParameterHandlerFoundForType)
    this.name = 'NoParameterHandlerFoundForType'
  }
}
