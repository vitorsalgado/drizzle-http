import { Class } from '../../../internal'
import { pathParameterRegex } from '../../../internal'
import { ToDest } from '../../../decorators'
import { Parameter } from '../Parameter'
import { HeaderParameter } from './HeaderParameterHandler'
import { QueryParameter } from './QueryParameterHandler'
import { QueryNameParameter } from './QueryNameParameterHandler'
import { PathParameter } from './PathParameterHandler'
import { FormParameter } from './FormParameterHandler'
import { BodyParameter } from './BodyParameterHandler'

export type DecoratedTypes = 'instance' | 'static'
export type Mapping = {
  to: ToDest
  key: string
  decorated: string
  type: DecoratedTypes
  parameter: Parameter
  model: unknown
}

export class ModelRegistry {
  private static readonly data: Mapping[] = []

  static register(
    to: ToDest,
    key: string,
    decorated: string,
    type: DecoratedTypes,
    parameter: Parameter,
    model: Class
  ): void {
    ModelRegistry.data.push({
      key,
      type,
      to,
      parameter,
      decorated,
      model
    })
  }

  static modelMappings(): Mapping[] {
    return [...ModelRegistry.data]
  }
}

export function createModelDecorator(to: ToDest, key?: string, field?: string) {
  return function (target: object | Class, decorated: string, _descriptor?: PropertyDescriptor | number): void {
    if (!decorated && field) {
      throw new Error('The parameter "field" is not allowed when decorating a class property or method.')
    }

    if (!decorated && !key && !field) {
      throw new Error(
        'When using a @Model() argument with constructor decorated parameters, ' +
          'you must provide at least the key. If the "key" differs from the constructor parameter name, ' +
          'you must provide the field parameter with the value matching the parameter name.'
      )
    }

    const dec = (decorated || key || field) as string
    const type: DecoratedTypes = typeof target === 'function' && decorated ? 'static' : 'instance'
    const model = typeof target === 'function' ? (target as Class) : (target.constructor as Class)
    const k = key || dec

    let parameter: Parameter

    switch (to) {
      case 'header':
        parameter = new HeaderParameter(k, -1)
        break
      case 'query':
        parameter = new QueryParameter(k, -1)
        break
      case 'queryname':
        parameter = new QueryNameParameter(-1)
        break
      case 'param':
        parameter = new PathParameter(k, pathParameterRegex(k), -1)
        break
      case 'field':
        parameter = new FormParameter(k, -1)
        break
      case 'body':
        parameter = new BodyParameter(-1)
        break
      case 'bodypart':
        parameter = new Parameter(-1, 'bodypart')
        break
    }

    ModelRegistry.register(to, k, dec, type, parameter, model)
  }
}
