import 'reflect-metadata'

export function extractArgumentTypes(target: any, method: string): any[] {
  return Reflect.getMetadata('design:paramtypes', target, method)
}

export function extractReturnType(target: any, method: string): any {
  return Reflect.getMetadata('design:returntype', target, method)
}
