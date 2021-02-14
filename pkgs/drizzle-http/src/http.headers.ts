export class Headers extends Map<string, string> {
  constructor(init: [string, string] | Record<string, string> | string[][] | null) {
    super()
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

    return super.set(Headers.normalizeHeaderName(name), value)
  }

  get(key: string): string | undefined {
    return super.get(Headers.normalizeHeaderName(key))
  }

  delete(key: string): boolean {
    return super.delete(Headers.normalizeHeaderName(key))
  }

  has(key: string): boolean {
    return super.has(Headers.normalizeHeaderName(key))
  }

  forEach(callback: (value: string, key: string, map: Map<string, string>) => void, thisArg?: any): void {
    for (const [key, value] of this) {
      callback.call(thisArg, value, key, this)
    }
  }

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

  // region Utils

  toObject(): Record<string, string> {
    return Object.fromEntries(this)
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
    return this.size === 0
  }

  // endregion
}
