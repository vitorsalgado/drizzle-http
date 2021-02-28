const REGEX_PCT = /%[0-9A-Fa-f][0-9A-Fa-f]/
const REGEX_ENCODE = /[!'()*]/g
const REGEX_ENCODED_SPACE = /%20/g

export function isEncoded(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const c = value.charAt(i)

    if (!isUnreserved(c) && c !== '%') {
      return false
    }
  }

  return REGEX_PCT.test(value)
}

export function fixedEncodeURIComponent(str: string): string {
  return encodeURIComponent(str).replace(REGEX_ENCODE, function (c) {
    return '%' + c.charCodeAt(0).toString(16)
  })
}

export function encodeURIComponentForForm(str: string): string {
  return encodeURIComponent(str)
    .replace(REGEX_ENCODE, function (c) {
      return '%' + c.charCodeAt(0).toString(16)
    })
    .replace(REGEX_ENCODED_SPACE, '+')
}

function isUnreserved(c: string): boolean {
  return ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) ||
    (c >= '0' && c <= '9') ||
    (c === '-' || c === '.' || c === '_' || c === '~')
}

export function pathParameterRegex(key: string): RegExp {
  return new RegExp('{' + key + '}', 'g')
}

export function isAbsolute(u: string): boolean {
  return u.indexOf('http://') === 0 || u.indexOf('https://') === 0
}

export function encodeIfNecessary(value: string): string {
  if (isEncoded(value)) {
    return value
  }

  return fixedEncodeURIComponent(value)
}

export function encodeFormFieldIfNecessary(value: string): string {
  if (isEncoded(value)) {
    return value
  }

  return encodeURIComponentForForm(value)
}
