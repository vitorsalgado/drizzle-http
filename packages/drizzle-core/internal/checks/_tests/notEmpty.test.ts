import { notEmpty } from '../index.js'

describe('notEmpty', function () {
  it('should throw error when value is null or undefined', function () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => notEmpty(null)).toThrowError()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => notEmpty(undefined)).toThrowError()
  })

  it('should not throw when Array is not empty', function () {
    expect(() => notEmpty(['test'])).not.toThrowError()
  })

  it('should not throw error when Map is not empty', function () {
    expect(() => notEmpty(new Map().set('key', 'value'))).not.toThrowError()
  })

  it('should not throw error when Set is not empty', function () {
    expect(() => notEmpty(new Set().add('item'))).not.toThrowError()
  })

  it('should not throw error when String is not empty', function () {
    expect(() => notEmpty('nice string value')).not.toThrowError()
  })

  it('should throw error when Array is empty', function () {
    expect(() => notEmpty([])).toThrow()
  })

  it('should throw error when Map is empty', function () {
    expect(() => notEmpty(new Map())).toThrow()
  })

  it('should throw error when Set is empty', function () {
    expect(() => notEmpty(new Set())).toThrow()
  })

  it('should throw error when String is empty', function () {
    expect(() => notEmpty('')).toThrow()
  })

  it('should return the same value provided when it is valid', function () {
    expect(notEmpty('test')).toEqual('test')
    expect(notEmpty(['test'])).toEqual(['test'])
    expect(notEmpty(new Set().add('test'))).toEqual(new Set().add('test'))
    expect(notEmpty(new Map().set('key', 'value'))).toEqual(new Map().set('key', 'value'))
  })
})
