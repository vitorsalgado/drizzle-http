import { headersFromRecord, headersToRecord, isHeadersEmpty, mergeHeaders, mergeHeadersObject } from '../headers.js'

describe('header utils', function () {
  it('should return isHeadersEmpty equal to true when there are no records', () => {
    expect(isHeadersEmpty(new Headers())).toBeTruthy()
  })

  it('should convert to record with keys and values', () => {
    const h = new Headers()
    h.set('name', 'test')
    h.set('age', '32')

    expect(headersToRecord(h)).toStrictEqual({
      name: 'test',
      age: '32'
    })
  })

  it('should merge object, ignoring existing keys', () => {
    const h = new Headers()
    const obj = {
      name: 'test',
      age: '32'
    }

    h.set('accept', 'everything')
    h.set('cache', 'always')
    mergeHeadersObject(h, obj)

    expect([...h]).toHaveLength(4)
    expect(h.get('accept')).toEqual('everything')
    expect(h.get('cache')).toEqual('always')
    expect(h.get('name')).toEqual('test')
    expect(h.get('age')).toEqual('32')
  })

  it('should merge two headers without overwriting existing keys', () => {
    const h1 = new Headers()
    h1.set('accept', 'everything')
    h1.set('cache', 'always')
    h1.set('server-status', 'exploded')

    const h2 = new Headers()
    h2.set('content', 'none')
    h2.set('happy', '*-*')

    mergeHeaders(h1, h2)
    h1.set('last', 'no')

    expect([...h1]).toHaveLength(6)
    expect([...h2]).toHaveLength(2)
    expect(h1.get('accept')).toEqual('everything')
    expect(h1.get('cache')).toEqual('always')
    expect(h1.get('server-status')).toEqual('exploded')
    expect(h1.get('content')).toEqual('none')
    expect(h1.get('happy')).toEqual('*-*')
    expect(h1.get('last')).toEqual('no')
  })

  it('should build headers from record with array values', () => {
    const h = headersFromRecord({
      'set-cookie': ['a=1', 'b=2'],
      'content-type': 'application/json'
    })

    expect(h.get('content-type')).toEqual('application/json')
    expect(h.getSetCookie()).toEqual(['a=1', 'b=2'])
  })

  it('should skip undefined values when building from record', () => {
    const h = headersFromRecord({
      name: 'test',
      age: undefined
    })

    expect([...h]).toHaveLength(1)
    expect(h.get('name')).toEqual('test')
  })
})
