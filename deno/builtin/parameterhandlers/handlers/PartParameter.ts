import { Parameter } from "../Parameter.ts";

export class PartParameter extends Parameter {
  static Type = "multipart";

  constructor(
    index: number,
    public readonly name: string,
    public readonly filename?: string,
  ) {
    super(index, PartParameter.Type);
  }
}
