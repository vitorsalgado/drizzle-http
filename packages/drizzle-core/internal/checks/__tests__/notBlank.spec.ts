import { notBlank } from '..'

describe('notBlank', function () {
  it('should not throw error when string is not blank', function () {
    expect(() => notBlank(' a ')).not.toThrowError()
    expect(() => notBlank('abc')).not.toThrowError()
  })

  it('should throw error when string is null or undefined', function () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => notBlank(null)).toThrowError()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => notBlank(undefined)).toThrowError()
  })

  it('should throw error when string is empty considering white spaces', function () {
    expect(() => notBlank('')).toThrowError()
    expect(() => notBlank('  ')).toThrowError()
  })

  it('should return the same value provided when it is valid', function () {
    expect(notBlank('test')).toEqual('test')
  })
})
