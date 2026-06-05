import { requestFactory } from '../../api_parameterization.js'
import { appendPendingMethodSetup, DRIZZLE_OWNER, methodName, resolveOwner } from '../../decorator_metadata.js'
import type { DrizzleDecoratorMetadata } from '../../decorator_metadata.js'
import type { TargetCtor } from '../../internal/index.js'

export function scheduleMemberSetup(metadata: DecoratorMetadata, isStatic: boolean, setup: () => void): void {
  if (isStatic) {
    setup()
  } else {
    appendPendingMethodSetup(metadata, setup)
  }
}

export function resolveApiCtor(
  metadata: DecoratorMetadata,
  isStatic: boolean,
  value: ((...args: unknown[]) => unknown) | undefined,
  allowPrototypeFallback: boolean
): TargetCtor {
  const meta = metadata as DrizzleDecoratorMetadata

  if (meta[DRIZZLE_OWNER]) {
    return meta[DRIZZLE_OWNER]
  }

  if (allowPrototypeFallback && value) {
    return resolveOwner(metadata, isStatic, value)
  }

  throw new TypeError(
    'Could not resolve API class for decorator. Apply a class decorator (e.g. @Path) before method decorators.'
  )
}

export function wrapWithInvoker<T extends (...args: never[]) => unknown>(
  metadata: DecoratorMetadata,
  isStatic: boolean,
  member: string,
  registeredCtor?: TargetCtor
): T {
  return function (...args: unknown[]) {
    const apiCtor = registeredCtor ?? resolveApiCtor(metadata, isStatic, undefined, false)
    const factory = requestFactory(apiCtor, member)

    return factory.invoker()?.(...args)
  } as unknown as T
}

export function fieldInitializerWrapper<T extends (...args: never[]) => unknown>(
  wrapFn: (initialValue: T) => T
): (initialValue: T) => T {
  return function (initialValue: T): T {
    return wrapFn(initialValue)
  }
}

export { methodName }
