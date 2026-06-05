import type { Class, TargetCtor } from './internal/index.js'
import type { ToDest } from './decorators/to.js'

export const DRIZZLE_OWNER = Symbol.for('drizzle-http:owner')

export type DrizzleDecoratorMetadata = DecoratorMetadata & {
  [DRIZZLE_OWNER]?: TargetCtor
}

export function setOwner(metadata: DecoratorMetadata, ctor: TargetCtor): void {
  ;(metadata as DrizzleDecoratorMetadata)[DRIZZLE_OWNER] = ctor
}

export function resolveOwner(
  metadata: DecoratorMetadata,
  staticMember: boolean,
  value: (...args: unknown[]) => unknown
): TargetCtor {
  const meta = metadata as DrizzleDecoratorMetadata

  if (meta[DRIZZLE_OWNER]) {
    return meta[DRIZZLE_OWNER]
  }

  if (staticMember) {
    const ctor = Object.getPrototypeOf(value) as TargetCtor

    if (typeof ctor === 'function') {
      setOwner(metadata, ctor)
      return ctor
    }
  } else {
    const proto = Object.getPrototypeOf(value)
    const ctor = proto?.constructor as TargetCtor | undefined

    if (typeof ctor === 'function') {
      setOwner(metadata, ctor)
      return ctor
    }
  }

  throw new TypeError(
    'Could not resolve API class for decorator. Apply a class decorator (e.g. @Path) before method decorators.'
  )
}

export function methodName(context: { name: string | symbol }): string {
  return typeof context.name === 'string' ? context.name : context.name.toString()
}

export const PENDING_MODEL_MAPPINGS = Symbol.for('drizzle-http:pending-model-mappings')

export interface PendingModelMapping {
  to: ToDest
  key: string
  decorated: string
  type: 'instance' | 'static'
}

const unboundModelMetadata = new Set<DecoratorMetadata>()
const unboundMethodMetadata = new Set<DecoratorMetadata>()
const associatedApiClasses = new Set<TargetCtor>()

export function associateApiClass(ctor: TargetCtor, skipDeferredRegistration = false): void {
  if (associatedApiClasses.has(ctor)) {
    return
  }

  associatedApiClasses.add(ctor)

  if (skipDeferredRegistration) {
    return
  }

  const direct = (ctor as TargetCtor & { [Symbol.metadata]?: DecoratorMetadata })[Symbol.metadata]

  if (direct) {
    setOwner(direct, ctor)
    flushPendingMethodSetups(direct)
    unboundMethodMetadata.delete(direct)
    return
  }

  const pending = [...unboundMethodMetadata]
  const metadata = pending[pending.length - 1]

  if (metadata) {
    setOwner(metadata, ctor)
    flushPendingMethodSetups(metadata)
    unboundMethodMetadata.delete(metadata)
  }
}

function declaredInstanceFieldNames(model: Class): Set<string> {
  const body = Function.prototype.toString.call(model).match(/\{([\s\S]*)\}/)?.[1]

  if (!body) {
    return new Set()
  }

  const names = new Set<string>()

  for (const match of body.matchAll(/^\s+(?:static\s+)?(\w+)\s*[!:?=]/gm)) {
    const name = match[1]

    if (name === 'constructor') {
      continue
    }

    names.add(name)
  }

  return names
}

function pendingMatchesModel(model: Class, pending: PendingModelMapping[]): boolean {
  const instanceFields = declaredInstanceFieldNames(model)

  return pending.every(entry => {
    if (entry.type === 'static') {
      return entry.decorated in model
    }

    if (instanceFields.size === 0) {
      return true
    }

    return instanceFields.has(entry.decorated)
  })
}

export function resolveModelMetadata(model: Class): DecoratorMetadata | undefined {
  const direct = (model as Class & { [Symbol.metadata]?: DecoratorMetadata })[Symbol.metadata]
  const directPending = pendingModelMappings(direct)

  if (directPending.length > 0 && pendingMatchesModel(model, directPending)) {
    return direct
  }

  for (const candidate of [...unboundModelMetadata]) {
    const pending = pendingModelMappings(candidate)

    if (pending.length === 0) {
      continue
    }

    if (pendingMatchesModel(model, pending)) {
      unboundModelMetadata.delete(candidate)
      return candidate
    }
  }

  return direct
}

export function appendPendingModelMapping(metadata: DecoratorMetadata, mapping: PendingModelMapping): void {
  const meta = metadata as DrizzleDecoratorMetadata & {
    [PENDING_MODEL_MAPPINGS]?: PendingModelMapping[]
  }

  if (!meta[PENDING_MODEL_MAPPINGS]) {
    meta[PENDING_MODEL_MAPPINGS] = []
  }

  meta[PENDING_MODEL_MAPPINGS].push(mapping)
  unboundModelMetadata.add(metadata)
}

export function pendingModelMappings(metadata: DecoratorMetadata | undefined): PendingModelMapping[] {
  if (!metadata) {
    return []
  }

  return (metadata as { [PENDING_MODEL_MAPPINGS]?: PendingModelMapping[] })[PENDING_MODEL_MAPPINGS] ?? []
}

export const PENDING_METHOD_SETUPS = Symbol.for('drizzle-http:pending-method-setups')

export function appendPendingMethodSetup(metadata: DecoratorMetadata, setup: () => void): void {
  const meta = metadata as DrizzleDecoratorMetadata & {
    [PENDING_METHOD_SETUPS]?: Array<() => void>
  }

  if (!meta[PENDING_METHOD_SETUPS]) {
    meta[PENDING_METHOD_SETUPS] = []
  }

  meta[PENDING_METHOD_SETUPS].push(setup)
  unboundMethodMetadata.add(metadata)
}

export function flushPendingMethodSetups(metadata: DecoratorMetadata): void {
  const meta = metadata as { [PENDING_METHOD_SETUPS]?: Array<() => void> }
  const pending = meta[PENDING_METHOD_SETUPS]

  if (!pending) {
    return
  }

  for (const setup of [...pending].reverse()) {
    setup()
  }

  meta[PENDING_METHOD_SETUPS] = []
}
