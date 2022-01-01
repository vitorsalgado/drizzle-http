// deno-lint-ignore-file no-explicit-any, ban-types

export type Ctor<T = any, Arguments extends unknown[] = any[]> = new (
  ...args: Arguments
) => T;

export type AbstractCtor<T = any, Arguments extends unknown[] = any[]> =
  abstract new (...args: Arguments) => T;

export type AnyCtor<T = any, Arguments extends unknown[] = any[]> =
  | Ctor<T, Arguments>
  | AbstractCtor<T, Arguments>;

export type Class<Arguments extends unknown[] = any[]> =
  & Ctor<unknown, Arguments>
  & { prototype: unknown };

export type AnyClass<Arguments extends unknown[] = any[]> =
  & AnyCtor<unknown, Arguments>
  & { prototype: unknown };

export type TargetCtor = Function;

export type TargetProto = Object;

export type Decorator = Function;

export interface Json {
  [x: string]:
    | string
    | number
    | boolean
    | Date
    | Json
    | JsonArray
    | null
    | undefined;
}

export type JsonArray = Array<
  string | number | boolean | Date | Json | JsonArray | null
>;

export type JsonType = Json | JsonArray;

export type IterableType<T> = T extends Iterable<infer E> ? E
  : T extends AsyncIterable<infer E> ? E
  : never;
