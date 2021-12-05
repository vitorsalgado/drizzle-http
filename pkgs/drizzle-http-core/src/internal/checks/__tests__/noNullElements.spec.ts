import { noNullElements } from '..'

describe('noNullElements', function () {
  it('should not throw when Array has no null or undefined elements', function () {
    expect(() => noNullElements(['test'])).not.toThrowError()
  })

  it('should not throw error when Map has no null or undefined elements', function () {
    expect(() => noNullElements(new Map().set('key', 'value'))).not.toThrowError()
  })

  it('should not throw error when Set has no null or undefined elements', function () {
    expect(() => noNullElements(new Set().add('item'))).not.toThrowError()
  })

  it('should throw error when Array has null or undefined elements', function () {
    expect(() => noNullElements([null, null])).toThrow()
    expect(() => noNullElements([undefined])).toThrow()
  })

  it('should throw error when Map has null or undefined elements', function () {
    expect(() => noNullElements(new Map().set(undefined, null))).toThrow()
    expect(() => noNullElements(new Map().set(null, null))).toThrow()
    expect(() => noNullElements(new Map().set(null, undefined))).toThrow()
    expect(() => noNullElements(new Map().set(undefined, undefined))).toThrow()
  })

  it('should throw error when Set has null or undefined elements', function () {
    expect(() => noNullElements(new Set().add(undefined))).toThrow()
    expect(() => noNullElements(new Set().add(null))).toThrow()
  })

  it('should return the same value provided when it is valid', function () {
    expect(noNullElements(['test'])).toEqual(['test'])
    expect(noNullElements(new Map().set('key', 'value'))).toEqual(new Map().set('key', 'value'))
    expect(noNullElements(new Set().add('test'))).toEqual(new Set().add('test'))
  })
})
