export function pathParameterRegex(key: string): RegExp {
  return new RegExp("{" + key + "}", "g");
}
