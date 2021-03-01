import { Headers } from './http.headers'

describe('Headers', function () {
  it('should init with object/2d array/null', () => {
    expect(() => new Headers(null)).not.toThrowError()
    expect(() => new Headers({})).not.toThrowError()
    expect(() => new Headers([])).not.toThrowError()
  })

  it('should fail when init with unidimensional array', () => {
    expect(() => new Headers(['test', 'value'])).toThrowError()
  })

  it('should init with key/value object', () => {
    const h = new Headers({ name: 'test', description: 'none', age: '32' })

    expect(h.size).toEqual(3)
    expect(h.get('name')).toEqual('test')
    expect(h.get('description')).toEqual('none')
    expect(h.get('age')).toEqual('32')
  })

  it('should init with 2d array', () => {
    const h = new Headers([['name', 'test'], ['description', 'none'], ['age', '32']])

    expect(h.size).toEqual(3)
    expect(h.get('name')).toEqual('test')
    expect(h.get('description')).toEqual('none')
    expect(h.get('age')).toEqual('32')
  })

  it('should fail when header name is null or empty', function () {
    const h = new Headers({})

    expect(() => h.set('', '')).toThrowError()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => h.set(null, '')).toThrowError()

    expect(() => h.append('', '')).toThrowError()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => h.append(null, '')).toThrowError()
  })

  it('should return isEmpty() equal to true when there is no records', () => {
    expect(new Headers({}).isEmpty()).toBeTruthy()
  })

  it('should set a entry with name normalized to lower case', function () {
    const h = new Headers({})

    const n1 = 'Content-Type'
    const v1 = 'json'
    const n2 = 'ACCEPT'
    const v2 = 'EveryTHING'

    h.set(n1, v1)
    h.set(n2, v2)

    expect(h.get(n1)).toStrictEqual(v1)
    expect(h.get(n2)).toStrictEqual(v2)

    expect(h.has(n1)).toBeTruthy()
    expect(h.has(n2)).toBeTruthy()

    expect(Array.from(h.keys())[0]).not.toEqual(n1)
    expect(Array.from(h.keys())[0]).toStrictEqual(n1.toLowerCase())
    expect(Array.from(h.keys())[1]).not.toEqual(n2)
    expect(Array.from(h.keys())[1]).toStrictEqual(n2.toLowerCase())
  })

  it('should append to header value when entry already exists', function () {
    const h = new Headers({})

    const name = 'Accept'
    const json = 'json'
    const xml = 'xml'
    const html = 'HTML'

    h.append(name, json)
    h.append(name, xml)
    h.append(name, html)

    expect(h.get(name)).toStrictEqual(`${json},${xml},${html}`)
  })

  it('should delete entry', function () {
    const h = new Headers([])

    h.append('test', 'value,another-value')
    const has = h.has('test')

    h.delete('test')
    const after = h.has('test')

    expect(has).toBeTruthy()
    expect(after).toBeFalsy()
    expect(h.isEmpty()).toBeTruthy()
  })

  it('should convert to object with keys and values', () => {
    const h = new Headers([])
    h.set('name', 'test')
    h.set('age', '32')

    expect(h.toObject()).toStrictEqual({ name: 'test', age: '32' })
  })

  it('should merge object, ignoring', () => {
    const h = new Headers([])
    const obj = { name: 'test', age: '32' }

    h.set('accept', 'everything')
    h.set('cache', 'always')
    h.mergeObject(obj)

    expect(h.size).toEqual(4)
    expect(h.get('accept')).toEqual('everything')
    expect(h.get('cache')).toEqual('always')
    expect(h.get('name')).toEqual('test')
    expect(h.get('age')).toEqual('32')
  })

  it('should merge two headers', () => {
    const h1 = new Headers([])
    const obj = { name: 'test', age: '32' }

    h1.set('accept', 'everything')
    h1.set('cache', 'always')
    h1.set('server-status', 'exploded')

    const h2 = new Headers([])
    h2.set('content', 'none')
    h2.set('happy', '*-*')

    h1.merge(h2)
    h1.set('last', 'no')

    expect(h1.size).toEqual(6)
    expect(h2.size).toEqual(2)
    expect(h1.get('accept')).toEqual('everything')
    expect(h1.get('cache')).toEqual('always')
    expect(h1.get('server-status')).toEqual('exploded')
    expect(h1.get('content')).toEqual('none')
    expect(h1.get('happy')).toEqual('*-*')
    expect(h1.get('last')).toEqual('no')
  })

  it('should return all values when calling .values()', () => {
    const h = new Headers({ name: 'test', description: 'none', age: '32' })
    const values = Array.from(h.values())

    expect(values).toHaveLength(3)
    expect(values).toContain('test')
    expect(values).toContain('none')
    expect(values).toContain('32')
  })

  it('should return all entries when calling .entries()', () => {
    const h = new Headers({ name: 'test', description: 'none', age: '32' })
    const values = Array.from(h.entries())

    expect(values).toHaveLength(3)
    expect(values[0]).toEqual(['name','test'])
    expect(values[1]).toEqual(['description', 'none'])
    expect(values[2]).toEqual(['age', '32'])
  })
})
