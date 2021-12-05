import 'reflect-metadata'
import { ReturnType } from '../types'

export function extractArgumentTypes(target: object | Function, method: string): unknown[] {
  return Reflect.getMetadata('design:paramtypes', target, method)
}

export function extractReturnType(target: object | Function, method: string): ReturnType {
  return Reflect.getMetadata('design:returntype', target, method)
}
