import { ApiDefaults } from "./ApiParameterization.ts";
import { BodyType } from "./BodyType.ts";
import {
  BodyParameter,
  FormParameter,
  HeaderParameter,
  Parameter,
  ParameterHandler,
  PathParameter,
  QueryNameParameter,
  QueryParameter,
} from "./builtin/mod.ts";
import { NoDrizzleUserAgent } from "./decorators/mod.ts";
import { Drizzle } from "./Drizzle.ts";
import { HttpHeaders, mergeHeaders } from "./HttpHeaders.ts";
import { HttpRequest } from "./HttpRequest.ts";
import {
  AnyClass,
  Decorator,
  InvalidMethodConfigError,
  isFunction,
  notBlank,
  notNull,
} from "./internal/mod.ts";
import { MediaTypes } from "./MediaTypes.ts";
import { RequestBodyConverter } from "./RequestBodyConverter.ts";
import { RequestParameterization } from "./RequestParameterization.ts";

const REGEX_EXTRACT_TEMPLATE_PARAMS = /({\w+})/g;
const REGEX_QUERY_STRING = /\?.+=*.*/;

/**
 * Builds a {@link Request} instance
 */
interface RequestBuilder {
  toRequest(args: unknown[]): HttpRequest;
}

/**
 * Holds values extracted from a decorated method to build an HTTP request.
 * This class values are not changed so, validations and pre-process should be made outside a request context.
 */
export class RequestFactory {
  constructor(
    public apiType: AnyClass | null = null,
    public method = "",
    public httpMethod = "",
    public path = "",
    public argLen = 0,
    public bodyIndex = -1,
    public defaultHeaders = new Headers(),
    public readTimeout: number | undefined = undefined,
    public connectTimeout: number | undefined = undefined,
    public parameterHandlers: {
      parameter: Parameter;
      handler: ParameterHandler;
    }[] = [],
    public parameters: Parameter[] = [],
    public signal: unknown = null,
    public noResponseConverter = false,
    public noResponseHandler = false,
    public readonly bag: Map<string, unknown> = new Map<string, unknown>(),
    public checkIfPathParamsAreInSyncWithUrl = true,
    public requestType = "",
    public responseType = "",
    public errorType = "",
    private preProcessed = false,
    private readonly decorators: Decorator[] = [],
    private readonly classDecorators: Decorator[] = [],
    private invokerFn: (<T>(...args: unknown[]) => T) | null = null,
  ) {
  }

  private static allPathParamsHaveKeys(params: Array<PathParameter>) {
    for (const param of params) {
      if (!param.key || !param.regex) {
        return false;
      }
    }

    return true;
  }

  private static hasKey(
    p: QueryParameter | HeaderParameter | PathParameter | FormParameter,
  ) {
    return p.key !== null && typeof p.key !== "undefined" && p.key.length > 0;
  }

  /**
   * Set the invoker for the API method associated with this instance.
   *
   * @internal
   * @param invoker - API method invoker function
   */
  defineInvoker(invoker: <T>(...args: unknown[]) => T) {
    notNull(invoker);
    isFunction(invoker);

    this.invokerFn = invoker;
  }

  /**
   * Returns the invocation function for the associated API method of this RequestFactory instance.
   * Must be called after defineInvoker() method is called.
   *
   * @internal
   */
  invoker(): (<T>(...args: unknown[]) => T) | null {
    return this.invokerFn;
  }

  /**
   * Pre Process and validate in sequence
   * @param drizzle - Drizzle instance associated with this RequestFactory
   */
  preProcessAndValidate(drizzle: Drizzle) {
    this.preProcess(drizzle);
    this.validate();
  }

  /**
   * Validates a RequestFactory instance.
   * This should be called outside a request context.
   */
  validate() {
    if (!this.preProcessed) {
      throw new Error(
        `RequestFactory for: ${this.method}. Called validate() before preProcess().`,
      );
    }

    if (!this.method) {
      throw this.invalidArgErr("No function reference");
    }

    if (!this.httpMethod) {
      throw this.invalidArgErr(
        "No HTTP Method. Use @GET(), @POST(), @PUT(), @DELETE(), @PATCH(), @OPTIONS() or @HEAD() decorators on method level.",
      );
    }

    if (
      (this.httpMethod === "GET" || this.httpMethod === "HEAD" ||
        this.httpMethod === "OPTIONS") && this.hasBody()
    ) {
      throw this.invalidArgErr(
        `Request with ${this.httpMethod} cannot have body.`,
      );
    }

    const queryParameters = this.getQueryParameters();
    const headerParameters = this.getHeaderParameters();
    const pathParameters = this.getPathParameters();
    const formParameters = this.getFormParameters();

    if (!queryParameters.every(RequestFactory.hasKey)) {
      throw this.invalidArgErr("There is a query parameter without key");
    }

    if (!headerParameters.every(RequestFactory.hasKey)) {
      throw this.invalidArgErr("There is a header parameter without key");
    }

    if (!formParameters.every(RequestFactory.hasKey)) {
      throw this.invalidArgErr("There is a form field parameter without key");
    }

    if (!RequestFactory.allPathParamsHaveKeys(pathParameters)) {
      throw this.invalidArgErr("There is a path parameter without key");
    }

    if (this.path.match(REGEX_QUERY_STRING)) {
      const paramsInQuery = this.path
        .substring(this.path.indexOf("?"), this.path.length)
        .match(REGEX_EXTRACT_TEMPLATE_PARAMS);

      if (paramsInQuery !== null && paramsInQuery.length > 0) {
        throw this.invalidArgErr(
          "URL query string must not have replace parameters with {}. Use @Query() decorator.",
        );
      }
    }

    const nonDupPathParams = new Set(
      this.path.match(REGEX_EXTRACT_TEMPLATE_PARAMS) ?? [],
    );

    if (
      pathParameters.length !== nonDupPathParams.size &&
      this.checkIfPathParamsAreInSyncWithUrl
    ) {
      throw this.invalidArgErr(
        "Path parameter configuration is not in sync with URL. " +
          "Check your path and arguments decorated with @Param().",
      );
    } else {
      for (const param of pathParameters) {
        if (!nonDupPathParams.has(`{${param.key}}`)) {
          throw this.invalidArgErr(
            `Parameter "${param.key}" doesn't exist in the URL replace parameters.`,
          );
        }
      }
    }

    if (this.isFormUrlEncoded()) {
      if (this.bodyIndex > 0 && formParameters.length > 0) {
        throw this.invalidArgErr(
          `${MediaTypes.APPLICATION_FORM_URL_ENCODED} request cannot contain both @Body() and @Field() decorators.`,
        );
      }
    } else {
      if (formParameters.length > 0) {
        throw this.invalidArgErr(
          `@Field() argument decorators can only be used with ${MediaTypes.APPLICATION_FORM_URL_ENCODED} requests. Maybe you are missing @FormUrlEncoded() decorator?`,
        );
      }
    }
  }

  /**
   * Pre-process the RequestFactory instance values to improve request build task.
   * Should be called outside request context.
   *
   * @param drizzle - Drizzle instance
   */
  preProcess(drizzle: Drizzle) {
    if (this.preProcessed) {
      throw new Error("This RequestFactory instance is already Pre Processed.");
    }

    if (!this.hasDecorator(NoDrizzleUserAgent)) {
      this.defaultHeaders.append("user-agent", "Drizzle-HTTP");
    }

    if (!this.path.startsWith("http:") || !this.path.startsWith("https:")) {
      const url = new URL(drizzle.baseUrl());

      if (/\/.+/.test(url.pathname)) {
        this.path = url.pathname + this.path;
      }
    }

    this.parameters
      .sort((a, b) => a.index - b.index)
      .forEach((parameter) =>
        this.parameterHandlers.push({
          parameter,
          handler: drizzle.parameterHandler(this, parameter),
        })
      );

    this.preProcessed = true;
  }

  /**
   * Merge current {@link RequestFactory} instance with values from
   * {@link ApiDefaults}.
   * This will only replace undefined values in RequestFactory.
   *
   * @param defaults - instance with default values for all methods
   */
  mergeWithApiDefaults(defaults: ApiDefaults | null) {
    if (defaults === null) {
      return;
    }

    mergeHeaders(defaults.headers, this.defaultHeaders);

    if (this.readTimeout === null || typeof this.readTimeout === "undefined") {
      this.readTimeout = defaults.readTimeout;
    }

    if (
      this.connectTimeout === null || typeof this.connectTimeout === "undefined"
    ) {
      this.connectTimeout = defaults.connectTimeout;
    }

    if (this.signal === null || typeof this.signal === "undefined") {
      this.signal = defaults.signal;
    }

    for (const [key, value] of defaults.bag) {
      if (!this.hasConfig(key)) {
        this.addConfig(key, value);
      }
    }

    if (!this.requestType) {
      this.requestType = defaults.requestType;
    }

    if (!this.responseType) {
      this.responseType = defaults.responseType;
    }

    if (!this.errorType) {
      this.errorType = defaults.errorType;
    }

    const p = defaults.path;

    if (p) {
      if (this.path.startsWith("/")) {
        this.path = p + this.path;
      } else {
        this.path = p + (this.path === "" ? "" : "/" + this.path);
      }
    }

    this.classDecorators.push(...defaults.decorators);
  }

  /**
   * Return API Class type that owns this Request Factory instance.
   */
  apiOwner(): AnyClass {
    return notNull(this.apiType);
  }

  /**
   * Check if this instance was already pre-processed
   */
  isPreProcessed() {
    return this.preProcessed;
  }

  /**
   * Get a {@link RequestBuilder} instance for a request
   *
   * @param drizzle - Drizzle instance
   */
  requestBuilder(drizzle: Drizzle) {
    if (this.containsDynamicParameters()) {
      return new DynamicParametrizedRequestBuilder(
        this,
        drizzle.requestBodyConverter(this),
      );
    }

    return new NoParametersRequestBuilder(this);
  }

  /**
   * Skip path params validation. Use this when customizing path params building.
   */
  skipCheckIfPathParamsAreInSyncWithUrl() {
    this.checkIfPathParamsAreInSyncWithUrl = false;
  }

  /**
   * Checks if there is any argument decorated with \@Body
   */
  hasBody() {
    return this.bodyIndex > -1;
  }

  /**
   * Register a method decorator.  It is not required to register all decorators.
   *
   * @param decorator - decorator function reference
   */
  registerDecorator(decorator: Decorator) {
    notNull(decorator);
    isFunction(decorator);

    this.decorators.push(decorator);
  }

  /**
   * Check if provided decorator was registered.
   *
   * @param decorator - decorator function reference
   * @returns boolean
   */
  hasDecorator(decorator: Decorator): boolean {
    notNull(decorator);
    isFunction(decorator);

    return this.decorators.includes(decorator) ||
      this.classDecorators.includes(decorator);
  }

  /**
   * Adds a configuration to the {@link RequestFactory} configuration bag
   *
   * @param key - configuration key
   * @param value - configuration value
   *
   * @throws DrizzleError
   */
  addConfig<T = unknown>(key: string, value: T) {
    notBlank(key, 'Parameters "key" cannot be null or empty.');
    notNull(value, 'Parameters "value" cannot be null.');

    this.bag.set(key, value);
  }

  /**
   * Get a configuration
   *
   * @param key - configuration key
   *
   * @throws DrizzleError
   */
  getConfig<R>(key: string) {
    notBlank(key, 'Parameter "key" cannot be null or empty.');

    return this.bag.get(key) as R;
  }

  /**
   * Check if config key exists
   *
   * @param key - configuration key
   */
  hasConfig(key: string): boolean {
    return this.bag.has(key);
  }

  /**
   * Get all configurations
   */
  allConfigs(): Map<string, unknown> {
    return new Map<string, unknown>(this.bag);
  }

  /**
   * Check if request type matches the provided value
   *
   * @param type - request type
   */
  requestTypeIs(type: string) {
    return this.requestType === type;
  }

  /**
   * Check if response type matches the provided value
   *
   * @param type - response type
   */
  responseTypeIs(type: string) {
    return this.responseType === type;
  }

  /**
   * Check if error type matches provided value
   *
   * @param type - error type
   */
  errorTypeIs(type: string) {
    return this.errorType === type;
  }

  /**
   * Check if defaultHeaders property contains a Header Content-Type containing the argument value.
   * Note: this will not take in consideration getHeaderParameters as they are resolved on each method call context.
   *
   * @param value - content-type
   */
  contentTypeContains(value: string) {
    const h = this.defaultHeaders.get(HttpHeaders.CONTENT_TYPE);

    if (h !== null && typeof h !== "undefined") {
      return h.indexOf(value) > -1;
    }

    return false;
  }

  /**
   * Check if defaultHeaders property contains a Header with argument key.
   * Note: this will not take in consideration getHeaderParameters as they are resolved on each method call context.
   *
   * @param key - header
   */
  hasHeader(key: string): boolean {
    return this.defaultHeaders.has(key);
  }

  /**
   * Check if defaultHeaders property contains a Header with key and value equal to the arguments.
   * Note: this will not take in consideration getHeaderParameters as they are resolved on each method call context.
   *
   * @param key - header key
   * @param value - header value
   */
  hasHeaderWithValue(key: string, value: string | string[]) {
    return this.defaultHeaders.get(key) === value;
  }

  /**
   * Add request parameter. E.g.: {@link QueryParameter}, {@link PathParameter}.
   * The parameter must have a registered {@link ParameterHandler}
   *
   * @param parameter - {@link Parameter} instance or extended class
   */
  addParameter<T extends Parameter>(parameter: T) {
    notNull(parameter);

    if (parameter instanceof BodyParameter) {
      if (this.parameters.find((x) => x.type === parameter.type)) {
        throw this.invalidArgErr(
          "Only one parameter decorated with @Body() is allowed.",
        );
      }

      this.bodyIndex = parameter.index;
    }

    this.parameters.push(parameter);
  }

  /**
   * Add request parameters. E.g.: {@link QueryParameter}, {@link PathParameter}.
   * The parameter must have a registered {@link ParameterHandler}
   *
   * @param parameters - array of {@link Parameter}
   */
  addParameters<T extends Parameter>(...parameters: T[]) {
    for (const parameter of parameters) {
      this.addParameter(parameter);
    }
  }

  /**
   * Check if request contains dynamic query parameters
   */
  hasQuery() {
    return this.getQueryParameters().length > 0;
  }

  /**
   * Return registered query parameters
   */
  getQueryParameters(): Array<QueryParameter> {
    return [
      ...(this.parameters.filter((x) =>
        x.type === QueryParameter.Type
      ) as Array<QueryParameter>),
    ];
  }

  /**
   * Check if request contains dynamic query name parameters
   */
  hasQueryNames() {
    return this.getQueryNameParameters().length > 0;
  }

  /**
   * Return registered query name parameters
   */
  getQueryNameParameters(): Array<QueryNameParameter> {
    return [
      ...(this.parameters.filter((x) =>
        x.type === QueryNameParameter.Type
      ) as Array<QueryNameParameter>),
    ];
  }

  /**
   * Check if request contains dynamic form field parameters
   */
  hasFormFields() {
    return this.getFormParameters().length > 0;
  }

  /**
   * Return registered form field parameters
   */
  getFormParameters(): Array<FormParameter> {
    return [
      ...(this.parameters.filter((x) => x.type === FormParameter.Type) as Array<
        FormParameter
      >),
    ];
  }

  /**
   * Check if request contains dynamic path parameters
   */
  hasPathParameters() {
    return this.getPathParameters().length > 0;
  }

  /**
   * Return registered path parameters
   */
  getPathParameters(): Array<PathParameter> {
    return [
      ...(this.parameters.filter((x) => x.type === PathParameter.Type) as Array<
        PathParameter
      >),
    ];
  }

  /**
   * Utility to add default fixed headers
   *
   * @param value - headers key/value object
   */
  addDefaultHeaders(value: Record<string, string>) {
    for (const [k, v] of Object.entries(value)) {
      this.defaultHeaders.append(k, v);
    }
  }

  /**
   * Utility to add default fixed headers
   *
   * @param name - header name
   * @param value - header value
   */
  addDefaultHeader(name: string, value: string) {
    this.defaultHeaders.append(name, value);
  }

  /**
   * Return registered header parameters
   */
  getHeaderParameters(): Array<HeaderParameter> {
    return [
      ...(this.parameters.filter((x) =>
        x.type === HeaderParameter.Type
      ) as Array<HeaderParameter>),
    ];
  }

  /**
   * Check if request function contains any argument
   */
  hasArgs() {
    return this.argLen > 0;
  }

  /**
   * Check if current request contains dynamic parameters.
   * This is useful to avoid unnecessary parameter processing in some Drizzle-Http components.
   */
  containsDynamicParameters() {
    return this.hasArgs() || this.parameters.length > 0 || this.hasBody();
  }

  /**
   * Check if {@link RequestFactory} contains a Content-Type header with: application/x-www-form-urlencoded
   */
  isFormUrlEncoded() {
    return this.contentTypeContains(MediaTypes.APPLICATION_FORM_URL_ENCODED);
  }

  /**
   * Skip response converters for a request.
   * @param value - yes/no to ignore response converters. defaults to true
   */
  ignoreResponseConverter(value = true) {
    this.noResponseConverter = value;
  }

  /**
   * Uses a noop response handler. Good when using caller or adapters that returns response types different from {@link Response}.
   *
   * @param value - yes/on to ignore response handlers. defaults to true
   */
  ignoreResponseHandler(value = true) {
    this.noResponseHandler = value;
  }

  private invalidArgErr(message: string) {
    return new InvalidMethodConfigError(this.method ?? "", message);
  }
}

/**
 * NoParametersRequestBuilder is simpler and faster and
 * should be used for requests that doesn't contain dynamic parameters.
 */
export class NoParametersRequestBuilder implements RequestBuilder {
  private readonly request: HttpRequest;

  constructor(requestFactory: RequestFactory) {
    this.request = new HttpRequest({
      url: requestFactory.path,
      method: requestFactory.httpMethod,
      headers: requestFactory.defaultHeaders,
      headersTimeout: requestFactory.connectTimeout,
      bodyTimeout: requestFactory.readTimeout,
      signal: requestFactory.signal,
      body: null,
    });
  }

  toRequest() {
    return this.request;
  }
}

/**
 * DynamicParametrizedRequestBuilder handles all aspects of an HTTP request
 */
export class DynamicParametrizedRequestBuilder implements RequestBuilder {
  constructor(
    private readonly requestFactory: RequestFactory,
    private readonly requestBodyConverter: RequestBodyConverter<BodyType>,
  ) {
  }

  toRequest(args: unknown[]) {
    const requestParameterization = RequestParameterization.newRequest(
      args,
      this.requestFactory.path,
      this.requestFactory.defaultHeaders,
      this.requestFactory.signal,
    );

    for (const p of this.requestFactory.parameterHandlers) {
      p.handler.handle(requestParameterization, args[p.parameter.index]);
    }

    if (
      requestParameterization.body === null && this.requestFactory.hasBody()
    ) {
      this.requestBodyConverter.convert(
        this.requestFactory,
        requestParameterization,
        args[this.requestFactory.bodyIndex] as BodyType,
      );
    }

    return new HttpRequest({
      url: requestParameterization.buildPath(),
      headers: requestParameterization.headers,
      method: this.requestFactory.httpMethod,
      body: requestParameterization.buildBody(),
      headersTimeout: this.requestFactory.connectTimeout,
      bodyTimeout: this.requestFactory.readTimeout,
      signal: requestParameterization.signal,
    });
  }
}
