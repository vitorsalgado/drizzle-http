import { ParameterHandler } from '../parameter_handler.js'
import { RequestFactory } from '../../../request_factory.js'
import { Drizzle } from '../../../drizzle.js'
import { Parameter } from '../parameter.js'
import { ParameterHandlerFactory } from '../parameter_handler_factory.js'
import { RequestParameterization } from '../../../request_parameterization.js'
import { RequestBodyConverter } from '../../../request_body_converter.js'
import { BodyType } from '../../../body_type.js'
import { Class } from '../../../internal/index.js'
import { QueryParameterHandler } from './query_parameter_handler.js'
import { QueryParameter } from './query_parameter_handler.js'
import { HeaderParameterHandler } from './header_parameter_handler.js'
import { HeaderParameter } from './header_parameter_handler.js'
import { QueryNameParameterHandler } from './query_name_parameter_handler.js'
import { FormParameterHandler } from './form_parameter_handler.js'
import { FormParameter } from './form_parameter_handler.js'
import { BodyParameterHandler } from './body_parameter_handler.js'
import { PathParameterHandler } from './path_parameter_handler.js'
import { PathParameter } from './path_parameter_handler.js'
import { Mapping } from './model_registry.js'
import { ModelRegistry } from './model_registry.js'

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
