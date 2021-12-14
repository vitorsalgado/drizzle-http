/* eslint-disable @typescript-eslint/no-explicit-any */

export type AbstractCtor = abstract new (...args: any[]) => any
export type Ctor = new (...args: any[]) => any

export type Mixin<T = object> = Ctor | AbstractCtor
