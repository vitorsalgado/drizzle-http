import { ParameterHandler } from '../ParameterHandler.ts'
import { RequestFactory } from '../../../RequestFactory.ts'
import { Drizzle } from '../../../Drizzle.ts'
import { Parameter } from '../Parameter.ts'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory.ts'
import { RequestParameterization } from '../../../RequestParameterization.ts'
import { encodeFormFieldIfNecessary } from '../../../internal/index.ts'

export class FormParameter extends Parameter {
  static Type = 'form_field'

  constructor(public readonly key: string, public readonly index: number) {
    super(index, FormParameter.Type)
  }
}

export class FormParameterHandler implements ParameterHandler<string | string[]> {
  constructor(readonly parameter: FormParameter) {}

  handle(requestValues: RequestParameterization, value: string | string[]): void {
    if (value === null || typeof value === 'undefined') {
      return
    }

    if (typeof value === 'string') {
      requestValues.formFields.push(this.parameter.key + '=' + encodeFormFieldIfNecessary(value))
    } else if (Array.isArray(value)) {
      for (const item of value) {
        requestValues.formFields.push(this.parameter.key + '=' + encodeFormFieldIfNecessary(item))
      }
    } else {
      requestValues.formFields.push(this.parameter.key + '=' + encodeFormFieldIfNecessary(String(value)))
    }
  }
}

export class FormParameterHandlerFactory implements ParameterHandlerFactory<FormParameter, string | string[]> {
  static INSTANCE: FormParameterHandlerFactory = new FormParameterHandlerFactory()

  provide(drizzle: Drizzle, rf: RequestFactory, p: FormParameter): ParameterHandler<string | string[]> | null {
    if (p.type === FormParameter.Type) {
      return new FormParameterHandler(p)
    }

    return null
  }
}
