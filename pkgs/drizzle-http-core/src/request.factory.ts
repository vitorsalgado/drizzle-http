import EventEmitter from 'events'
import { BodyType, ReturnType } from './types'
import { Drizzle } from './drizzle'
import { Check, InvalidRequestMethodConfigurationError } from './internal'
import { RequestBodyConverter } from './request.body.converter'
import { ApiInstanceMeta } from './drizzle.meta'
import { Parameter, ParameterHandler } from './request.parameter.handler'
import {
  BodyParameter,
  FormParameter,
  FormParameterType,
  HeaderParameter,
  HeaderParameterType,
  PathParameter,
  PathParameterType,
  QueryNameParameter,
  QueryNameParameterType,
  QueryParameter,
  QueryParameterType
} from './request.parameters'
import { RequestParameterization } from './request.parameterization'
import { MediaTypes } from './http.media.types'
import { DzHeaders } from './http.headers'
import CommonHeaders from './http.common.headers'
import { DzRequest } from './DzRequest'
import { RequestBuilder } from './request.builder'

const REGEX_EXTRACT_TEMPLATE_PARAMS = /({\w+})/g
const REGEX_QUERY_STRING = /\?.+=*.*/

/**
 * Holds values extracted from a decorated method to build an HTTP request.
 * This class values are not changed so, validations and pre-process should be made outside a request context.
 */
export class RequestFactory {
  method: string
  httpMethod: string
  path: string
  argLen: number
  argTypes: unknown[]
  bodyIndex: number
  defaultHeaders: DzHeaders
  readTimeout?: number
  connectTimeout?: number
  returnType: ReturnType | null | undefined
  returnGenericType: ReturnType | null | undefined
  parameterHandlers!: ParameterHandler<Parameter, unknown>[]
  parameters: Parameter[]
  signal: EventEmitter | unknown
  noResponseConverter: boolean

  // This holds generic values used by additional adapters, converters and callers
  private readonly bag: Map<string, unknown>
  private preProcessed: boolean

  constructor() {
    this.method = ''
    this.httpMethod = ''
    this.path = ''
    this.argLen = 0
    this.argTypes = []
    this.bodyIndex = -1
    this.defaultHeaders = new DzHeaders()
    this.readTimeout = undefined
    this.connectTimeout = undefined
    this.returnType = undefined
    this.returnGenericType = undefined
    this.bag = new Map<string, unknown>()
    this.preProcessed = false
    this.parameterHandlers = []
    this.parameters = []
    this.signal = null
    this.noResponseConverter = false
  }

  /**
   * Pre Process and validate in sequence
   * @param drizzle - Drizzle instance associated with this RequestFactory
   */
  preProcessAndValidate(drizzle: Drizzle): void {
    this.preProcess(drizzle)
    this.validate()
  }

  /**
   * Validates a RequestFactory instance.
   * This should be called outside a request context.
   */
  validate(): void {
    if (!this.preProcessed) {
      throw new Error(`RequestFactory for: ${this.method}. Called validate() before preProcess().`)
    }

    if (!this.method) {
      throw this.invalidArgErr('No function reference')
    }

    if (!this.httpMethod) {
      throw this.invalidArgErr(
        'No HTTP Method. Use @GET(), @POST(), @PUT(), @DELETE(), @PATCH(), @OPTIONS() or @HEAD() decorators on method level.'
      )
    }

    if ((this.httpMethod === 'GET' || this.httpMethod === 'HEAD' || this.httpMethod === 'OPTIONS') && this.hasBody()) {
      throw this.invalidArgErr(`Request with ${this.httpMethod} cannot have body.`)
    }

    const queryParameters = this.getQueryParameters()
    const headerParameters = this.getHeaderParameters()
    const pathParameters = this.getPathParameters()
    const formParameters = this.getFormParameters()

    if (!queryParameters.every(RequestFactory.hasKey)) {
      throw this.invalidArgErr('There is a query parameter without key')
    }

    if (!headerParameters.every(RequestFactory.hasKey)) {
      throw this.invalidArgErr('There is a header parameter without key')
    }

    if (!formParameters.every(RequestFactory.hasKey)) {
      throw this.invalidArgErr('There is a form field parameter without key')
    }

    if (!RequestFactory.allPathParamsHaveKeys(pathParameters)) {
      throw this.invalidArgErr('There is a path parameter without key')
    }

    if (this.path.match(REGEX_QUERY_STRING)) {
      const paramsInQuery = this.path
        .substring(this.path.indexOf('?'), this.path.length)
        .match(REGEX_EXTRACT_TEMPLATE_PARAMS)

      if (paramsInQuery !== null && paramsInQuery.length > 0) {
        throw this.invalidArgErr('URL query string must not have replace parameters with {}. Use @Query() decorator.')
      }
    }

    const nonDupPathParams = new Set(this.path.match(REGEX_EXTRACT_TEMPLATE_PARAMS) ?? [])

    if (pathParameters.length !== nonDupPathParams.size) {
      throw this.invalidArgErr(
        'Path parameter configuration is not in sync with URL. ' +
          'Check your path and arguments decorated with @Param().'
      )
    } else {
      for (const param of pathParameters) {
        if (!nonDupPathParams.has(`{${param.key}}`)) {
          throw this.invalidArgErr(`Parameter "${param.key}" doesn't exist in the URL replace parameters.`)
        }
      }
    }

    if (this.isFormUrlEncoded()) {
      if (this.bodyIndex > 0 && formParameters.length > 0) {
        throw this.invalidArgErr(
          `${MediaTypes.APPLICATION_FORM_URL_ENCODED_UTF8} request cannot contain both @Body() and @Field() decorators.`
        )
      }
    } else {
      if (formParameters.length > 0) {
        throw this.invalidArgErr(
          `@Field() argument decorators can only be used with ${MediaTypes.APPLICATION_FORM_URL_ENCODED_UTF8} requests. Maybe you are missing @FormUrlEncoded() decorator?`
        )
      }
    }
  }

  /**
   * Pre-process the RequestFactory instance values to improve request build task.
   * Should be called outside request context.
   *
   * @param drizzle - Drizzle instance
   */
  preProcess(drizzle: Drizzle): void {
    if (this.preProcessed) {
      throw new Error('This RequestFactory instance is already Pre Processed.')
    }

    if (!drizzle.headers.isEmpty()) {
      this.defaultHeaders.merge(drizzle.headers)
    }

    if (!this.path.startsWith('http:') || !this.path.startsWith('https:')) {
      const url = new URL(drizzle.baseUrl)

      if (/\/.+/.test(url.pathname)) {
        this.path = url.pathname + this.path
      }
    }

    this.parameters
      .sort((a, b) => a.index - b.index)
      .forEach(parameter => {
        const handlerFactory = drizzle.parameterHandlerFactory(this, parameter)
        const handler = handlerFactory.parameterHandler(drizzle, this, parameter)

        this.parameterHandlers.push(handler)
      })

    this.preProcessed = true
  }

  /**
   * Merge current {@link RequestFactory} instance with values from
   * {@link ApiInstanceMeta}.
   * This will only replace undefined values in RequestFactory.
   *
   * @param instanceMeta - instance with default values for all methods
   */
  mergeWithInstanceMeta(instanceMeta: ApiInstanceMeta): void {
    if (instanceMeta === null || typeof instanceMeta === 'undefined') {
      return
    }

    this.defaultHeaders.merge(instanceMeta.defaultHeaders)

    if (this.readTimeout === null || typeof this.readTimeout === 'undefined') {
      this.readTimeout = instanceMeta.readTimeout
    }

    if (this.connectTimeout === null || typeof this.connectTimeout === 'undefined') {
      this.connectTimeout = instanceMeta.connectTimeout
    }

    if (this.signal === null || typeof this.signal === 'undefined') {
      this.signal = instanceMeta.signal
    }

    const p = instanceMeta.getPath()

    if (p) {
      if (this.path.startsWith('/')) {
        this.path = p + this.path
      } else {
        this.path = p + '/' + this.path
      }
    }
  }

  /**
   * Get a {@link RequestBuilder} instance for a request
   *
   * @param drizzle - Drizzle instance
   */
  requestBuilder(drizzle: Drizzle): RequestBuilder {
    if (this.containsDynamicParameters()) {
      return new DynamicParametrizedRequestBuilder(this, drizzle.requestBodyConverter(this.method, this))
    }

    return new NoParametersRequestBuilder(this)
  }

  /**
   * Checks if there is any argument decorated with \@Body
   */
  hasBody(): boolean {
    return this.bodyIndex > -1
  }

  /**
   * Adds a configuration to the {@link RequestFactory} configuration bag
   *
   * @param key - configuration key
   * @param value - configuration value
   *
   * @throws {@link DrizzleError}
   */
  addConfig(key: string, value: unknown): void {
    Check.emptyStr(key, 'Parameters "key" cannot be null or empty.')
    Check.nullOrUndefined(value, 'Parameters "value" cannot be null.')

    this.bag.set(key, value)
  }

  /**
   * Get a configuration
   *
   * @param key - configuration key
   *
   * @throws {@link DrizzleError}
   */
  getConfig<R>(key: string): R {
    Check.emptyStr(key, 'Parameter "key" cannot be null or empty.')

    return this.bag.get(key) as R
  }

  /**
   * Get all configurations
   * @returns configurations map
   */
  allConfigs(): Map<string, unknown> {
    return new Map<string, unknown>(this.bag)
  }

  /**
   * Check if defaultHeaders property contains a Header Content-Type containing the argument value.
   * Note: this will not take in consideration getHeaderParameters as they are resolved on each method call context.
   *
   * @param value - content-handledType
   */
  contentTypeContains(value: string): boolean {
    const h = this.defaultHeaders.get(CommonHeaders.CONTENT_TYPE)

    if (h !== null && typeof h !== 'undefined') {
      return h.indexOf(value) > -1
    }

    return false
  }

  /**
   * Check if defaultHeaders property contains a Header with argument key.
   * Note: this will not take in consideration getHeaderParameters as they are resolved on each method call context.
   *
   * @param key - header
   */
  hasHeader(key: string): boolean {
    return this.defaultHeaders.has(key)
  }

  /**
   * Check if defaultHeaders property contains a Header with key and value equal to the arguments.
   * Note: this will not take in consideration getHeaderParameters as they are resolved on each method call context.
   *
   * @param key - header key
   * @param value - header value
   */
  hasHeaderWithValue(key: string, value: string | string[]): boolean {
    return this.defaultHeaders.get(key) === value
  }

  /**
   * Validate return handledType
   * @param type - return class handledType
   */
  isReturnTypeOf(type: ReturnType): boolean {
    return this.returnType !== null && typeof this.returnType !== 'undefined' && this.returnType === type
  }

  /**
   * Validate the generic return handledType
   * @param type - return class handledType
   */
  isGenericReturnTypeOf(type: ReturnType): boolean {
    return (
      this.returnGenericType !== null &&
      typeof this.returnGenericType !== 'undefined' &&
      this.returnGenericType === type
    )
  }

  /**
   * Add request parameter. E.g.: {@link QueryParameter}, {@link PathParameter}.
   * The parameter must have a registered {@link ParameterHandler}
   *
   * @param parameter - {@link Parameter} instance or extended class
   */
  addParameter<T extends Parameter>(parameter: T): void {
    if (parameter === null) {
      throw new TypeError('Parameter must not be null.')
    }

    if (parameter instanceof BodyParameter) {
      if (this.parameters.find(x => x.type === parameter.type)) {
        throw this.invalidArgErr('Only one parameter decorated with @Body() is allowed.')
      }

      this.bodyIndex = parameter.index
    }

    this.parameters.push(parameter)
  }

  /**
   * Add request parameters. E.g.: {@link QueryParameter}, {@link PathParameter}.
   * The parameter must have a registered {@link ParameterHandler}
   *
   * @param parameters - array of {@link Parameter}
   */
  addParameters<T extends Parameter>(...parameters: T[]): void {
    for (const parameter of parameters) {
      this.addParameter(parameter)
    }
  }

  /**
   * Check if request contains dynamic query parameters
   */
  hasQuery(): boolean {
    return this.getQueryParameters().length > 0
  }

  /**
   * Return registered query parameters
   */
  getQueryParameters(): Array<QueryParameter> {
    return [...(this.parameters.filter(x => x.type === QueryParameterType) as Array<QueryParameter>)]
  }

  /**
   * Check if request contains dynamic query name parameters
   */
  hasQueryNames(): boolean {
    return this.getQueryNameParameters().length > 0
  }

  /**
   * Return registered query name parameters
   */
  getQueryNameParameters(): Array<QueryNameParameter> {
    return [...(this.parameters.filter(x => x.type === QueryNameParameterType) as Array<QueryNameParameter>)]
  }

  /**
   * Check if request contains dynamic form field parameters
   */
  hasFormFields(): boolean {
    return this.getFormParameters().length > 0
  }

  /**
   * Return registered form field parameters
   */
  getFormParameters(): Array<FormParameter> {
    return [...(this.parameters.filter(x => x.type === FormParameterType) as Array<FormParameter>)]
  }

  /**
   * Check if request contains dynamic path parameters
   */
  hasPathParameters(): boolean {
    return this.getPathParameters().length > 0
  }

  /**
   * Return registered path parameters
   */
  getPathParameters(): Array<PathParameter> {
    return [...(this.parameters.filter(x => x.type === PathParameterType) as Array<PathParameter>)]
  }

  /**
   * Utility to add default fixed headers
   *
   * @param value - headers key/value object
   */
  addDefaultHeaders(value: Record<string, string>): void {
    for (const [k, v] of Object.entries(value)) {
      this.defaultHeaders.append(k, v)
    }
  }

  /**
   * Utility to add default fixed headers
   *
   * @param name - header name
   * @param value - header value
   */
  addDefaultHeader(name: string, value: string): void {
    this.defaultHeaders.append(name, value)
  }

  /**
   * Return registered header parameters
   */
  getHeaderParameters(): Array<HeaderParameter> {
    return [...(this.parameters.filter(x => x.type === HeaderParameterType) as Array<HeaderParameter>)]
  }

  /**
   * Check if request function contains any argument
   */
  hasArgs(): boolean {
    return this.argLen > 0
  }

  /**
   * Check if current request contains dynamic parameters.
   * This is useful to avoid unnecessary parameter processing in some Drizzle-Http components.
   * @returns true / false
   */
  containsDynamicParameters(): boolean {
    return this.hasArgs() || this.parameters.length > 0 || this.hasBody()
  }

  /**
   * Check if {@link RequestFactory} contains a Content-Type header with: application/x-www-form-urlencoded
   */
  isFormUrlEncoded(): boolean {
    return this.contentTypeContains(MediaTypes.APPLICATION_FORM_URL_ENCODED_UTF8)
  }

  /**
   * Skip response converters for a request.
   * @param value - yes/no to ignore response converters. defaults to true
   */
  ignoreResponseConverter(value = true): void {
    this.noResponseConverter = value
  }

  private invalidArgErr(message: string): InvalidRequestMethodConfigurationError {
    return new InvalidRequestMethodConfigurationError(this.method ?? '', message)
  }

  private static allPathParamsHaveKeys(params: Array<PathParameter>): boolean {
    for (const param of params) {
      if (!param.key || !param.regex) {
        return false
      }
    }

    return true
  }

  private static hasKey(p: QueryParameter | HeaderParameter | PathParameter | FormParameter): boolean {
    return p.key !== null && typeof p.key !== 'undefined' && p.key.length > 0
  }
}

/**
 * NoParametersRequestBuilder is simpler and faster and
 * should be used for requests that doesn't contain dynamic parameters.
 */
export class NoParametersRequestBuilder implements RequestBuilder {
  private readonly request: DzRequest

  constructor(requestFactory: RequestFactory) {
    this.request = new DzRequest({
      url: requestFactory.path,
      method: requestFactory.httpMethod,
      headers: requestFactory.defaultHeaders,
      headersTimeout: requestFactory.connectTimeout,
      bodyTimeout: requestFactory.readTimeout,
      signal: requestFactory.signal,
      body: null
    })
  }

  toRequest(): DzRequest {
    return this.request
  }
}

/**
 * DynamicParametrizedRequestBuilder handles all aspects of an HTTP request
 */
export class DynamicParametrizedRequestBuilder implements RequestBuilder {
  constructor(
    private readonly requestFactory: RequestFactory,
    private readonly requestBodyConverter: RequestBodyConverter<BodyType>
  ) {}

  toRequest(args: unknown[]): DzRequest {
    const requestParameterization = new RequestParameterization(
      args,
      this.requestFactory.path,
      [],
      this.requestFactory.defaultHeaders,
      [],
      null,
      this.requestFactory.signal
    )

    for (let i = 0; i < this.requestFactory.parameterHandlers.length; i++) {
      const ph = this.requestFactory.parameterHandlers[i]
      ph.apply(requestParameterization, args[ph.parameter.index])
    }

    if (requestParameterization.body === null && this.requestFactory.hasBody()) {
      this.requestBodyConverter.convert(
        this.requestFactory,
        requestParameterization,
        args[this.requestFactory.bodyIndex] as BodyType
      )
    }

    return new DzRequest({
      url: requestParameterization.buildPath(),
      headers: requestParameterization.headers,
      method: this.requestFactory.httpMethod,
      body: requestParameterization.buildBody(),
      headersTimeout: this.requestFactory.connectTimeout,
      bodyTimeout: this.requestFactory.readTimeout,
      signal: requestParameterization.signal
    })
  }
}
