const sHeaders = Symbol('headers')

export class Headers {
  private readonly [sHeaders]: Map<string, string>

  constructor(init: [string, string] | Record<string, string> | string[][] | null) {
    this[sHeaders] = new Map<string, string>()
    this.initialize(init)
  }

  append(name: string, value: string): void {
    if (!name || name.length === 0) {
      throw new TypeError('Header name must not be null or empty.')
    }

    const existing = this.get(name)
    const newValue = existing ? existing + ',' + value : value

    this.set(Headers.normalizeHeaderName(name), newValue)
  }

  set(name: string, value: string): this {
    if (!name || name.length === 0) {
      throw new TypeError('Header name must not be null or empty.')
    }

    this[sHeaders].set(Headers.normalizeHeaderName(name), value)

    return this
  }

  get(key: string): string | undefined {
    return this[sHeaders].get(Headers.normalizeHeaderName(key))
  }

  delete(key: string): boolean {
    return this[sHeaders].delete(Headers.normalizeHeaderName(key))
  }

  has(key: string): boolean {
    return this[sHeaders].has(Headers.normalizeHeaderName(key))
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

  get size(): number {
    return this[sHeaders].size
  }

  [Symbol.iterator](): IterableIterator<[string, string]> {
    return this[sHeaders][Symbol.iterator]()
  }

  // region Utils

  toObject(): Record<string, string> {
    return Array
      .from(this[sHeaders])
      .reduce((obj, [key, value]) =>
        (Object.assign(obj, { [key]: value })), {})
  }

  merge(headers: Headers): void {
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

  isEmpty(): boolean {
    return this[sHeaders].size === 0
  }

  // endregion

  private static normalizeHeaderName(name: string): string {
    return name.toLowerCase()
  }

  private initialize(init: any): void {
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
