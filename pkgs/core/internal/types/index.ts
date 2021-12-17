/* eslint-disable @typescript-eslint/no-explicit-any */

export type Ctor<T = any, Arguments extends unknown[] = any[]> = new (...args: Arguments) => T
export type AbstractCtor<T = any, Arguments extends unknown[] = any[]> = abstract new (...args: Arguments) => T
export type AnyCtor<T = any, Arguments extends unknown[] = any[]> = Ctor<T, Arguments> | AbstractCtor<T, Arguments>
export type Class<Arguments extends unknown[] = any[]> = Ctor<unknown, Arguments> & { prototype: unknown }
export type AnyClass<Arguments extends unknown[] = any[]> = AnyCtor<unknown, Arguments> & { prototype: unknown }
export type TargetClass = Function
export type ClassDecorator<T extends Ctor = new (...args: any[]) => any> = (target: T) => InstanceType<T>
export type MethodDecorator = (target: object, method: string, descriptor: PropertyDescriptor) => any
