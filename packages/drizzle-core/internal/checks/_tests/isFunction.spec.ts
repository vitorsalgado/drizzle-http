import { isFunction } from '../isFunction.js'

describe('isFunction', function () {
  it('should throw error when argument is not a function', function () {
    expect(() => isFunction('abc')).toThrowError()
  })

  it('should not fail when argument is a function type', function () {
    expect(() => isFunction(() => 'hello world')).not.toThrowError()
  })
})
