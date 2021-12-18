/* eslint-disable @typescript-eslint/no-explicit-any */

import { ParameterHandler } from '../ParameterHandler'
import { RequestFactory } from '../../../RequestFactory'
import { Drizzle } from '../../../Drizzle'
import { Parameter } from '../Parameter'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory'
import { RequestParameterization } from '../../../RequestParameterization'
import { QueryParameterHandler } from './QueryParameterHandler'
import { HeaderParameterHandler } from './HeaderParameterHandler'
import { QueryNameParameterHandler } from './QueryNameParameterHandler'
import { FormParameterHandler } from './FormParameterHandler'
import { BodyParameterHandler } from './BodyParameterHandler'
import { PathParameterHandler } from './PathParameterHandler'
import { ModelMapping } from "./ModelRegistry";
import { ModelRegistry } from "./ModelRegistry";
import { HeaderParameter } from "./HeaderParameterHandler";

export class ModelArgumentParameter extends Parameter {
  static Type = 'request_map'

  constructor(public readonly index: number, public readonly source: string, public readonly target: any) {
    super(index, ModelArgumentParameter.Type)
  }
}

export class ModelParameterHandler implements ParameterHandler<ModelArgumentParameter, Record<string, unknown>> {
  constructor(
    readonly parameter: ModelArgumentParameter,
    readonly mappings: ModelMapping[],
    readonly headerParameterHandler: HeaderParameterHandler,
    readonly queryParameterHandler: QueryParameterHandler,
    readonly queryNameParameterHandler: QueryNameParameterHandler,
    readonly pathParameterHandler: PathParameterHandler,
    readonly formParameterHandler: FormParameterHandler,
    readonly bodyParameterHandler: BodyParameterHandler
  ) {}

  apply(requestValues: RequestParameterization, value: any): void {
    for (const map of this.mappings) {
      let v

      if (map.type === 'property') {
        v = value[map.key]
      } else if (map.type === 'method') {
        v = (value[map.key] as Function)()
      } else if (map.type === 'static') {
        const source = this.parameter.target[map.key]

        if (typeof source === 'function') {
          v = this.parameter.target[map.key]()
        } else {
          v = this.parameter.target[map.key]
        }
      }

      switch (map.to) {
        case 'header':
          this.headerParameterHandler.apply(requestValues, v)
          break
        case 'query':
          this.queryParameterHandler.apply(requestValues, v)
          break
        case 'queryname':
          this.queryNameParameterHandler.apply(requestValues, v)
          break
        case 'param':
          this.pathParameterHandler.apply(requestValues, v)
          break
        case 'field':
          this.formParameterHandler.apply(requestValues, v)
          break
        case 'body':
          this.bodyParameterHandler.apply(requestValues, v)
          break
      }
    }
  }
}

export class ModelArgumentParameterHandlerFactory implements ParameterHandlerFactory<ModelArgumentParameter, object> {
  static INSTANCE: ModelArgumentParameterHandlerFactory = new ModelArgumentParameterHandlerFactory()

  forType = (): string => ModelArgumentParameter.Type

  provide(
    drizzle: Drizzle,
    requestFactory: RequestFactory,
    p: ModelArgumentParameter
  ): ParameterHandler<ModelArgumentParameter, object> {
    const mapping = ModelRegistry.mapping(p.target, p.source)
    const mappings = ModelRegistry.mappingsForType(p.target)

    return new ModelParameterHandler(
      p,
      mappings,
      ModelRegistry.register().(p.type), new HeaderParameterHandler(mapping.parameter as HeaderParameter))
  }
}
