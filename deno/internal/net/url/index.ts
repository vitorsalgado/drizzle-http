export function pathParameterRegex(key: string): RegExp {
  return new RegExp('{' + key + '}', 'g')
}

export function isAbsolute(u: string): boolean {
  return u.indexOf('http://') === 0 || u.indexOf('https://') === 0
}
