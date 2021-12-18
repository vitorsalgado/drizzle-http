import { Class } from '../../../internal'
import { pathParameterRegex } from '../../../internal'
import { ToDest } from '../../../decorators/To'
import { Parameter } from '../Parameter'
import { HeaderParameter } from './HeaderParameterHandler'
import { QueryParameter } from './QueryParameterHandler'
import { QueryNameParameter } from './QueryNameParameterHandler'
import { PathParameter } from './PathParameterHandler'
import { FormParameter } from './FormParameterHandler'
import { BodyParameter } from './BodyParameterHandler'

export type ModelMapSourceTypes = 'method' | 'property' | 'static'
export type ModelMapping = { to: ToDest; key: string; source: string; type: ModelMapSourceTypes; parameter: Parameter }
export type RequestModelMappings = Map<Class, Array<ModelMapping>>

export class ModelRegistry {
  private static readonly data: RequestModelMappings = new Map()

  static register(
    target: Class,
    to: ToDest,
    key: string,
    source: string,
    type: ModelMapSourceTypes,
    parameter: Parameter
  ): void {
    const current = ModelRegistry.data.get(target)

    if (!current) {
      ModelRegistry.data.set(target, [
        {
          key,
          type,
          to,
          parameter,
          source
        }
      ])
      return
    }

    current.push({
      key,
      type,
      to,
      parameter,
      source
    })
  }

  static mappingsForType(type: Class): Array<ModelMapping> {
    return ModelRegistry.data.get(type) ?? []
  }

  static mapping(type: Class, key: string): ModelMapping | undefined {
    return (ModelRegistry.data.get(type) ?? []).find(x => x.key === key)
  }
}

export function createModelDecorator(source: string, to: ToDest, key?: string) {
  return function (target: object | Class, prop: string, descriptor?: PropertyDescriptor): void {
    const type: ModelMapSourceTypes = typeof target === 'function' ? 'static' : descriptor ? 'method' : 'property'
    const k = key || prop
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
    }

    ModelRegistry.register(
      typeof target === 'function' ? (target as Class) : (target.constructor as Class),
      to,
      k,
      source,
      type,
      parameter
    )
  }
}
