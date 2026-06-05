import { Class } from '../../../internal/index.js'
import { pathParameterRegex } from '../../../internal/index.js'
import {
  appendPendingModelMapping,
  methodName,
  PENDING_MODEL_MAPPINGS,
  pendingModelMappings,
  resolveModelMetadata,
  type PendingModelMapping
} from '../../../decorator_metadata.js'
import { ToDest } from '../../../decorators/index.js'
import { Parameter } from '../parameter.js'
import { HeaderParameter } from './header_parameter_handler.js'
import { QueryParameter } from './query_parameter_handler.js'
import { QueryNameParameter } from './query_name_parameter_handler.js'
import { PathParameter } from './path_parameter_handler.js'
import { FormParameter } from './form_parameter_handler.js'
import { BodyParameter } from './body_parameter_handler.js'

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

function createParameterForMapping(to: ToDest, key: string): Parameter {
  switch (to) {
    case 'header':
      return new HeaderParameter(key, -1)
    case 'query':
      return new QueryParameter(key, -1)
    case 'queryname':
      return new QueryNameParameter(-1)
    case 'param':
      return new PathParameter(key, pathParameterRegex(key), -1)
    case 'field':
      return new FormParameter(key, -1)
    case 'body':
      return new BodyParameter(-1)
    case 'bodypart':
      return new Parameter(-1, 'bodypart')
  }
}

function registerPendingEntry(model: Class, mapping: PendingModelMapping): void {
  const parameter = createParameterForMapping(mapping.to, mapping.key)

  ModelRegistry.register(mapping.to, mapping.key, mapping.decorated, mapping.type, parameter, model)
}

const registeredModelClasses = new WeakSet<object>()

export function registerModelMappings(model: Class): void {
  if (registeredModelClasses.has(model)) {
    return
  }

  const metadata = resolveModelMetadata(model)
  const pending = pendingModelMappings(metadata)

  if (pending.length === 0) {
    return
  }

  registeredModelClasses.add(model)

  for (const mapping of pending) {
    registerPendingEntry(model, mapping)
  }

  if (metadata) {
    ;(metadata as { [PENDING_MODEL_MAPPINGS]?: PendingModelMapping[] })[PENDING_MODEL_MAPPINGS] = []
  }
}

function queueMapping(
  metadata: DecoratorMetadata,
  to: ToDest,
  key: string | undefined,
  field: string | undefined,
  decorated: string,
  type: DecoratedTypes
): void {
  if (field) {
    throw new Error('The parameter "field" is not allowed when decorating a class property or method.')
  }

  const dec = decorated
  const k = key || dec

  appendPendingModelMapping(metadata, {
    to,
    key: k,
    decorated: dec,
    type
  })
}

export function createModelDecorator(to: ToDest, key?: string, field?: string) {
  return function (
    value: ((...args: unknown[]) => unknown) | undefined,
    context:
      | ClassFieldDecoratorContext
      | ClassMethodDecoratorContext
      | ClassGetterDecoratorContext
      | ClassSetterDecoratorContext
  ): void | ((...args: unknown[]) => unknown) {
    if (context.kind === 'field') {
      queueMapping(context.metadata, to, key, field, methodName(context), context.static ? 'static' : 'instance')
      return
    }

    if (context.kind === 'method') {
      queueMapping(context.metadata, to, key, field, methodName(context), context.static ? 'static' : 'instance')
      return value
    }

    if (context.kind === 'getter' || context.kind === 'setter') {
      queueMapping(context.metadata, to, key, field, methodName(context), 'instance')
      return value
    }

    throw new TypeError('@To* decorators must be applied to fields, methods, or accessors.')
  }
}
