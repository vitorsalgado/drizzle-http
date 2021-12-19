import { ParameterHandler } from '../ParameterHandler'
import { RequestFactory } from '../../../RequestFactory'
import { Drizzle } from '../../../Drizzle'
import { Parameter } from '../Parameter'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory'
import { RequestParameterization } from '../../../RequestParameterization'
import { RequestBodyConverter } from '../../../RequestBodyConverter'
import { BodyType } from '../../../BodyType'
import { Class } from '../../../internal'
import { QueryParameterHandler } from './QueryParameterHandler'
import { QueryParameter } from './QueryParameterHandler'
import { HeaderParameterHandler } from './HeaderParameterHandler'
import { HeaderParameter } from './HeaderParameterHandler'
import { QueryNameParameterHandler } from './QueryNameParameterHandler'
import { FormParameterHandler } from './FormParameterHandler'
import { FormParameter } from './FormParameterHandler'
import { BodyParameterHandler } from './BodyParameterHandler'
import { PathParameterHandler } from './PathParameterHandler'
import { PathParameter } from './PathParameterHandler'
import { Mapping } from './ModelRegistry'
import { ModelRegistry } from './ModelRegistry'

export class ModelParameter extends Parameter {
  static Type = 'model'

  constructor(public readonly index: number, public readonly decorated: string, public readonly model: Class) {
    super(index, ModelParameter.Type)
  }
}

export class ModelParameterHandler implements ParameterHandler<Record<string, unknown>> {
  constructor(
    private readonly model: unknown,
    private readonly mappings: Mapping[],
    private readonly parameterHandlers: Map<string, ParameterHandler>,
    private readonly requestFactory: RequestFactory,
    private readonly converter: RequestBodyConverter<BodyType>
  ) {}

  handle(requestValues: RequestParameterization, value: Record<string, unknown>): void {
    const bodyParts: Record<string, unknown> = {}
    const hasBodyPart = this.mappings.some(x => x.to === 'bodypart')

    for (const map of this.mappings) {
      let v
      let s

      if (map.type === 'instance') {
        s = value[map.decorated]
      } else {
        s = (this.model as Record<string, unknown>)[map.decorated]
      }

      if (typeof s === 'function') {
        v = s()
      } else {
        v = s
      }

      if (map.to === 'bodypart') {
        bodyParts[map.decorated] = v
      } else {
        this.parameterHandlers.get(map.decorated)?.handle(requestValues, v)
      }
    }

    if (hasBodyPart) {
      this.converter.convert(this.requestFactory, requestValues, bodyParts as unknown as BodyType)
    }
  }
}

export class ModelArgumentParameterHandlerFactory implements ParameterHandlerFactory<ModelParameter, object> {
  static INSTANCE: ModelArgumentParameterHandlerFactory = new ModelArgumentParameterHandlerFactory()

  provide(drizzle: Drizzle, requestFactory: RequestFactory, p: ModelParameter): ParameterHandler<object> | null {
    if (p.type !== ModelParameter.Type) {
      return null
    }

    const mappings = ModelRegistry.modelMappings().filter(x => x.model === p.model)
    const parameterHandlers: Map<string, ParameterHandler> = new Map()

    for (const mapping of mappings) {
      const prop = mapping.decorated
      const param = mapping.parameter

      switch (mapping.to) {
        case 'header':
          parameterHandlers.set(prop, new HeaderParameterHandler(param as HeaderParameter))
          break
        case 'query':
          parameterHandlers.set(prop, new QueryParameterHandler(param as QueryParameter))
          break
        case 'queryname':
          parameterHandlers.set(prop, QueryNameParameterHandler.INSTANCE)
          break
        case 'param':
          parameterHandlers.set(prop, new PathParameterHandler(param as PathParameter))
          break
        case 'field':
          parameterHandlers.set(prop, new FormParameterHandler(param as FormParameter))
          break
        case 'body':
          parameterHandlers.set(
            prop,
            new BodyParameterHandler(
              drizzle.requestBodyConverter(requestFactory.method, requestFactory),
              requestFactory
            )
          )
          break
      }
    }

    return new ModelParameterHandler(
      p.model,
      mappings,
      parameterHandlers,
      requestFactory,
      drizzle.requestBodyConverter(requestFactory.method, requestFactory)
    )
  }
}
