const sHeaders = Symbol('headers')

export class HttpHeaders implements Headers {
  public static readonly CONTENT_TYPE = 'content-type'
  public static readonly ACCEPT = 'accept'

  private readonly [sHeaders]: Map<string, string>

  constructor(init: [string, string] | Record<string, string> | string[][] | null = {}) {
    this[sHeaders] = new Map<string, string>()
    this.initialize(init)
  }

  get size(): number {
    return this[sHeaders].size
  }

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  private static normalizeHeaderName(name: string): string {
    return name.toLowerCase()
  }

  append(name: string, value: string): void {
    if (!name || name.length === 0) {
      throw new TypeError('Header name must not be null or empty.')
    }

    const existing = this.get(name)
    const newValue = existing ? existing + ',' + value : value

    this.set(HttpHeaders.normalizeHeaderName(name), newValue)
  }

  set(name: string, value: string): this {
    if (!name || name.length === 0) {
      throw new TypeError('Header name must not be null or empty.')
    }

    this[sHeaders].set(HttpHeaders.normalizeHeaderName(name), value)

    return this
  }

  get(key: string): string | null {
    const item = this[sHeaders].get(HttpHeaders.normalizeHeaderName(key))

    if (!item) {
      return null
    }

    return item
  }

  delete(key: string): boolean {
    return this[sHeaders].delete(HttpHeaders.normalizeHeaderName(key))
  }

  has(key: string): boolean {
    return this[sHeaders].has(HttpHeaders.normalizeHeaderName(key))
  }

  keys(): IterableIterator<string> {
    return this[sHeaders].keys()
  }

  values(): IterableIterator<string> {
    return this[sHeaders].values()
  }

  entries(): IterableIterator<[string, string]> {
    return this[sHeaders].entries()
  }

  forEach(callback: (value: string, key: string, parent: Headers) => void, thisArg?: unknown): void {
    for (const [key, value] of this[sHeaders]) {
      callback.call(thisArg, value, key, this)
    }
  }

  [Symbol.iterator](): IterableIterator<[string, string]> {
    return this[sHeaders][Symbol.iterator]()
  }

  // region Utils

  toString(): string {
    const str: string[] = []

    for (const [key, value] of this.entries()) {
      str.push(key + ': ' + value)
    }

    return str.join('\n')
  }

  toObject(): Record<string, string> {
    return Array.from(this[sHeaders]).reduce((obj, [key, value]) => Object.assign(obj, { [key]: value }), {})
  }

  merge(headers: HttpHeaders): void {
    for (const [name, value] of headers) {
      if (!this.has(name)) {
        this.set(name, value)
      }
    }
  }

  mergeObject(obj: Record<string, string>): void {
    for (const [k, v] of Object.entries(obj)) {
      if (!this.has(k)) {
        this.set(k, v)
      }
    }
  }

  // endregion

  isEmpty(): boolean {
    return this[sHeaders].size === 0
  }

  private initialize(init: [string, string] | Record<string, string> | string[][] | null): void {
    if (init !== null) {
      if (Array.isArray(init)) {
        for (let i = 0; i < init.length; i++) {
          const h = init[i]

          if (h.length !== 2) {
            throw new TypeError('Header init must be an 2d array or an object.')
          }

          const [k, v] = init[i]

          this.append(k, v)
        }
      } else if (typeof init === 'object') {
        this.mergeObject(init)
      }
    }
  }
}
