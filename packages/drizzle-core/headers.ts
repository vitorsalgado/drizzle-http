export const CommonHeaders = {
  CONTENT_TYPE: 'content-type',
  ACCEPT: 'accept'
} as const

export function mergeHeaders(target: Headers, source: Headers): void {
  for (const [name, value] of source) {
    if (!target.has(name)) {
      target.set(name, value)
    }
  }
}

export function mergeHeadersObject(target: Headers, obj: Record<string, string>): void {
  for (const [k, v] of Object.entries(obj)) {
    if (!target.has(k)) {
      target.set(k, v)
    }
  }
}

export function headersToRecord(headers: Headers): Record<string, string> {
  return Object.fromEntries(headers.entries())
}

export function isHeadersEmpty(headers: Headers): boolean {
  for (const _ of headers) {
    return false
  }

  return true
}

export function headersFromRecord(record: Record<string, string | readonly string[] | undefined>): Headers {
  const headers = new Headers()

  for (const [name, value] of Object.entries(record)) {
    if (value === undefined) {
      continue
    }

    if (Array.isArray(value)) {
      for (const v of value) {
        headers.append(name, v)
      }
    } else if (typeof value === 'string') {
      headers.append(name, value)
    }
  }

  return headers
}
