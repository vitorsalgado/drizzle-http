import { Parameter } from '../parameter.js'

export class PartParameter extends Parameter {
  static Type = 'multipart'

  constructor(index: number, public readonly name: string, public readonly filename?: string) {
    super(index, PartParameter.Type)
  }
}
