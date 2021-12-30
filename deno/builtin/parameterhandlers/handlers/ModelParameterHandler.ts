import { ParameterHandler } from '../ParameterHandler.ts'
import { RequestFactory } from '../../../RequestFactory.ts'
import { Drizzle } from '../../../Drizzle.ts'
import { Parameter } from '../Parameter.ts'
import { ParameterHandlerFactory } from '../ParameterHandlerFactory.ts'
import { RequestParameterization } from '../../../RequestParameterization.ts'
import { RequestBodyConverter } from '../../../RequestBodyConverter.ts'
import { BodyType } from '../../../BodyType.ts'
import { Class } from '../../../internal/index.ts'
import { QueryParameterHandler } from './QueryParameterHandler.ts'
import { QueryParameter } from './QueryParameterHandler.ts'
import { HeaderParameterHandler } from './HeaderParameterHandler.ts'
import { HeaderParameter } from './HeaderParameterHandler.ts'
import { QueryNameParameterHandler } from './QueryNameParameterHandler.ts'
import { FormParameterHandler } from './FormParameterHandler.ts'
import { FormParameter } from './FormParameterHandler.ts'
import { BodyParameterHandler } from './BodyParameterHandler.ts'
import { PathParameterHandler } from './PathParameterHandler.ts'
import { PathParameter } from './PathParameterHandler.ts'
import { Mapping } from './ModelRegistry.ts'
import { ModelRegistry } from './ModelRegistry.ts'

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
            new BodyParameterHandler(drizzle.requestBodyConverter(requestFactory), requestFactory)
          )
          break
      }
    }

    return new ModelParameterHandler(
      p.model,
      mappings,
      parameterHandlers,
      requestFactory,
      drizzle.requestBodyConverter(requestFactory)
    )
  }
}
