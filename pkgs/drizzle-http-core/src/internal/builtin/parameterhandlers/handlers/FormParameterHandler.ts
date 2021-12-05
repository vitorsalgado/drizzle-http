import { ParameterHandler } from '../ParameterHandler'
import { RequestFactory } from '../../../../request.factory'
import { Drizzle } from '../../../../drizzle'
import { Parameter } from '../Parameter'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory'
import { RequestParameterization } from '../../../../request.parameterization'
import { encodeFormFieldIfNecessary } from '../../../encoding'

export const FormParameterType = 'form_field'

export class FormParameter extends Parameter {
  constructor(public readonly key: string, public readonly index: number) {
    super(index, FormParameterType)
  }
}

export class FormParameterHandler extends ParameterHandler<FormParameter, string | string[]> {
  apply(requestValues: RequestParameterization, value: string | string[]): void {
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
