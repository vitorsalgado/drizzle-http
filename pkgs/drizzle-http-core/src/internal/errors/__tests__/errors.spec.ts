import {
  DrizzleError,
  InvalidMethodConfigError,
  NoParameterHandlerError,
  NoRequestConverterError,
  RequestBodyTypeNotAllowedError
} from '..'

describe('Errors', function () {
  it('should contain basic fields name and code', function () {
    const codeStart = 'DRIZZLE_HTTP_ERR'

    const drizzleError = new DrizzleError('message', '')
    const invalidRequestMethodConfigurationError = new InvalidMethodConfigError('method', 'some message')
    const requestBodyTypeNotAllowed = new RequestBodyTypeNotAllowedError('method', 'message')
    const noRequestConverterError = new NoRequestConverterError('method')
    const noParameterHandlerFoundForType = new NoParameterHandlerError('type', 'method', 1)

    // DrizzleError
    expect(drizzleError.code).not.toBeNull()
    expect(drizzleError.code).not.toBeUndefined()
    expect(drizzleError.code.startsWith(codeStart))
    expect(drizzleError.message).not.toBeNull()
    expect(drizzleError.message).not.toBeUndefined()
    expect(drizzleError.message.length).toBeGreaterThan(0)

    // InvalidRequestMethodConfigurationError
    expect(invalidRequestMethodConfigurationError.code).not.toBeNull()
    expect(invalidRequestMethodConfigurationError.code).not.toBeUndefined()
    expect(invalidRequestMethodConfigurationError.code.startsWith(codeStart))
    expect(invalidRequestMethodConfigurationError.message).not.toBeNull()
    expect(invalidRequestMethodConfigurationError.message).not.toBeUndefined()
    expect(invalidRequestMethodConfigurationError.message.length).toBeGreaterThan(0)

    // RequestBodyTypeNotAllowed
    expect(requestBodyTypeNotAllowed.code).not.toBeNull()
    expect(requestBodyTypeNotAllowed.code).not.toBeUndefined()
    expect(requestBodyTypeNotAllowed.code.startsWith(codeStart))
    expect(requestBodyTypeNotAllowed.message).not.toBeNull()
    expect(requestBodyTypeNotAllowed.message).not.toBeUndefined()
    expect(requestBodyTypeNotAllowed.message.length).toBeGreaterThan(0)

    // NoRequestConverterError
    expect(noRequestConverterError.code).not.toBeNull()
    expect(noRequestConverterError.code).not.toBeUndefined()
    expect(noRequestConverterError.code.startsWith(codeStart))
    expect(noRequestConverterError.message).not.toBeNull()
    expect(noRequestConverterError.message).not.toBeUndefined()
    expect(noRequestConverterError.message.length).toBeGreaterThan(0)

    // NoParameterHandlerFoundForType
    expect(noParameterHandlerFoundForType.code).not.toBeNull()
    expect(noParameterHandlerFoundForType.code).not.toBeUndefined()
    expect(noParameterHandlerFoundForType.code.startsWith(codeStart))
    expect(noParameterHandlerFoundForType.message).not.toBeNull()
    expect(noParameterHandlerFoundForType.message).not.toBeUndefined()
    expect(noParameterHandlerFoundForType.message.length).toBeGreaterThan(0)
  })

  it('should accept null method', function () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const invalidRequestMethodConfigurationError = new InvalidMethodConfigError(null, 'some message')

    expect(invalidRequestMethodConfigurationError.method).toBeNull()
  })
})
