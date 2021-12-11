import { notNull } from '..'

describe('notNull', function () {
  it('should not throw error when value is a empty string', function () {
    expect(() => notNull('')).not.toThrowError()
  })

  it('should not throw error when value is 0', function () {
    expect(() => notNull(0)).not.toThrowError()
  })

  it('should not throw error when value is false', function () {
    expect(() => notNull(false)).not.toThrowError()
  })

  it('should throw error when value is null', function () {
    expect(() => notNull(null)).toThrow()
  })

  it('should throw error when value is undefined', function () {
    expect(() => notNull(undefined)).toThrow()
  })

  it('should return the same value provided when it is valid', function () {
    expect(notNull('test')).toEqual('test')
  })
})
