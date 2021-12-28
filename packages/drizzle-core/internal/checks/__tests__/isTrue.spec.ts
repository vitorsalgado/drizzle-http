import { isTrue } from '..'

describe('isTrue', function () {
  it('should not throw error when condition is met', function () {
    const value = 'test'

    expect(() => isTrue(value === 'test')).not.toThrowError()
    expect(() => isTrue(10 > 1000)).toThrowError()
  })
})
