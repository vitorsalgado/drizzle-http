import { encodeFormFieldIfNecessary, encodeIfNecessary } from './internal'
import { Parameter, ParameterHandler, ParameterHandlerFactory } from './request.parameter.handler'
import { RequestFactory } from './request.factory'
import { Drizzle } from './drizzle'
import { BodyType } from './types'
import { RequestBodyConverter } from './request.body.converter'
import { RequestValues } from './request.values'

// region Query

export const QueryParameterType = 'query'

export class QueryParameter extends Parameter {
  constructor(public readonly key: string, public readonly index: number) {
    super(index, QueryParameterType)
  }
}

export class QueryParameterHandler extends ParameterHandler<QueryParameter, string | string[]> {
  apply(requestValues: RequestValues, value: string | string[]): void {
    if (value === null || typeof value === 'undefined') {
      return
    }

    if (typeof value === 'string') {
      requestValues.query.push(this.parameter.key + '=' + encodeIfNecessary(value))
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        requestValues.query.push(this.parameter.key + '=' + encodeIfNecessary(value[i]))
      }
    } else {
      requestValues.query.push(this.parameter.key + '=' + encodeIfNecessary(String(value)))
    }
  }
}

export class QueryParameterHandlerFactory extends ParameterHandlerFactory<QueryParameter, string | string[]> {
  static INSTANCE: QueryParameterHandlerFactory = new QueryParameterHandlerFactory()

  handledType = (): string => QueryParameterType

  parameterHandler(
    _drizzle: Drizzle,
    _rf: RequestFactory,
    p: QueryParameter
  ): ParameterHandler<QueryParameter, string | string[]> {
    return new QueryParameterHandler(p)
  }
}

// endregion

// region Query Name

export const QueryNameParameterType = 'query_name'

export class QueryNameParameter extends Parameter {
  constructor(index: number) {
    super(index, QueryNameParameterType)
  }
}

export class QueryNameParameterHandler extends ParameterHandler<QueryNameParameter, string | string[]> {
  apply(requestValues: RequestValues, value: string | string[]): void {
    if (typeof value === 'string') {
      requestValues.query.push(encodeIfNecessary(value))
    } else if (Array.isArray(value)) {
      requestValues.query.push(encodeIfNecessary(value.join('&')))
    } else {
      requestValues.query.push(encodeIfNecessary(String(value)))
    }
  }
}

export class QueryNameParameterHandlerFactory extends ParameterHandlerFactory<QueryNameParameter, string | string[]> {
  static INSTANCE: QueryNameParameterHandlerFactory = new QueryNameParameterHandlerFactory()

  handledType = (): string => QueryNameParameterType

  parameterHandler(
    _drizzle: Drizzle,
    _rf: RequestFactory,
    p: QueryNameParameter
  ): ParameterHandler<QueryNameParameter, string | string[]> {
    return new QueryNameParameterHandler(p)
  }
}

// endregion

// region Path

export const PathParameterType = 'path_param'

export class PathParameter extends Parameter {
  constructor(public readonly key: string, public readonly regex: RegExp, public readonly index: number) {
    super(index, PathParameterType)
  }
}

export class PathParameterHandler extends ParameterHandler<PathParameter, string | string[]> {
  apply(requestValues: RequestValues, value: string | string[]): void {
    if (value === null || typeof value === 'undefined') {
      throw new TypeError(`Path parameter "${this.parameter.key}" must not be null or undefined.`)
    }

    let v: string | string[]

    if (typeof value === 'string') {
      v = value
    } else if (Array.isArray(value)) {
      v = value.join(',')
    } else {
      v = String(value)
    }

    requestValues.path = requestValues.path.replace(this.parameter.regex, encodeIfNecessary(v))
  }
}

export class PathParameterHandlerFactory extends ParameterHandlerFactory<PathParameter, string | string[]> {
  static INSTANCE: PathParameterHandlerFactory = new PathParameterHandlerFactory()

  handledType = (): string => PathParameterType

  parameterHandler(
    _drizzle: Drizzle,
    _rf: RequestFactory,
    p: PathParameter
  ): ParameterHandler<PathParameter, string | string[]> {
    return new PathParameterHandler(p)
  }
}

// endregion

// region Form

export const FormParameterType = 'form_field'

export class FormParameter extends Parameter {
  constructor(public readonly key: string, public readonly index: number) {
    super(index, FormParameterType)
  }
}

export class FormParameterHandler extends ParameterHandler<FormParameter, string | string[]> {
  apply(requestValues: RequestValues, value: string | string[]): void {
    if (value === null || typeof value === 'undefined') {
      return
    }

    if (typeof value === 'string') {
      requestValues.formFields.push(this.parameter.key + '=' + encodeFormFieldIfNecessary(value))
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        requestValues.formFields.push(this.parameter.key + '=' + encodeFormFieldIfNecessary(value[i]))
      }
    } else {
      requestValues.formFields.push(this.parameter.key + '=' + encodeFormFieldIfNecessary(String(value)))
    }
  }
}

export class FormParameterHandlerFactory extends ParameterHandlerFactory<FormParameter, string | string[]> {
  static INSTANCE: FormParameterHandlerFactory = new FormParameterHandlerFactory()

  handledType = (): string => FormParameterType

  parameterHandler(
    _drizzle: Drizzle,
    _rf: RequestFactory,
    p: FormParameter
  ): ParameterHandler<FormParameter, string | string[]> {
    return new FormParameterHandler(p)
  }
}

// endregion

// region Header

export const HeaderParameterType = 'header'

export class HeaderParameter extends Parameter {
  constructor(public readonly key: string, public readonly index: number) {
    super(index, HeaderParameterType)
  }
}

export class HeaderParameterHandler extends ParameterHandler<HeaderParameter, string | string[]> {
  apply(requestValues: RequestValues, value: string | string[]): void {
    if (value === null || typeof value === 'undefined') {
      return
    }

    if (typeof value === 'string') {
      requestValues.headers.append(this.parameter.key, value)
    } else if (Array.isArray(value)) {
      requestValues.headers.append(this.parameter.key, value.join(','))
    } else {
      requestValues.headers.append(this.parameter.key, String(value))
    }
  }
}

export class HeaderParameterHandlerFactory extends ParameterHandlerFactory<HeaderParameter, string | string[]> {
  static INSTANCE: HeaderParameterHandlerFactory = new HeaderParameterHandlerFactory()

  handledType = (): string => HeaderParameterType

  parameterHandler(
    _drizzle: Drizzle,
    _rf: RequestFactory,
    p: HeaderParameter
  ): ParameterHandler<HeaderParameter, string | string[]> {
    return new HeaderParameterHandler(p)
  }
}

// endregion

// region Body

export const BodyParameterType = 'body'

export class BodyParameter extends Parameter {
  constructor(public readonly index: number) {
    super(index, BodyParameterType)
  }
}

export class BodyParameterHandler extends ParameterHandler<BodyParameter, BodyType> {
  constructor(
    private readonly converter: RequestBodyConverter<BodyType>,
    private readonly requestFactory: RequestFactory,
    parameter: BodyParameter
  ) {
    super(parameter)
  }

  apply(requestValues: RequestValues, value: BodyType): void {
    if (value === null || typeof value === 'undefined') {
      return
    }

    this.converter.convert(this.requestFactory, requestValues, value)
  }
}

export class BodyParameterHandlerFactory extends ParameterHandlerFactory<BodyParameter, BodyType> {
  static INSTANCE: BodyParameterHandlerFactory = new BodyParameterHandlerFactory()

  handledType = (): string => BodyParameterType

  parameterHandler(
    drizzle: Drizzle,
    requestFactory: RequestFactory,
    p: BodyParameter
  ): ParameterHandler<BodyParameter, BodyType> {
    return new BodyParameterHandler(
      drizzle.requestBodyConverter(requestFactory.method, requestFactory),
      requestFactory,
      p
    )
  }
}

// endregion

// region Cancellation

export const SignalParameterType = 'signal'

export class SignalParameter extends Parameter {
  constructor(public readonly index: number) {
    super(index, SignalParameterType)
  }
}

export class SignalParameterHandler extends ParameterHandler<SignalParameter, any> {
  apply(requestValues: RequestValues, value: any): void {
    if (value === null || typeof value === 'undefined') {
      throw new TypeError(`Signal parameter must not be null or undefined. (Index: ${this.parameter.index})`)
    }

    requestValues.signal = value
  }
}

export class SignalParameterHandlerFactory extends ParameterHandlerFactory<SignalParameter, any> {
  static INSTANCE: SignalParameterHandlerFactory = new SignalParameterHandlerFactory()

  handledType = (): string => SignalParameterType

  parameterHandler(
    drizzle: Drizzle,
    requestFactory: RequestFactory,
    p: SignalParameter
  ): ParameterHandler<SignalParameter, any> {
    return new SignalParameterHandler(p)
  }
}

// endregion
