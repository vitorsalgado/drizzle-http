import { oneOf } from '../oneOf'

describe('oneOf', function () {
  it('should return same value when value is within the accepted values list', function () {
    const value = 'test'
    const accepted = ['test', 'other', 'nothing']

    const result = oneOf(value, accepted)

    expect(result).toEqual(value)
  })

  it('should throw error when value is not in the accepted values list', function () {
    expect.assertions(1)

    const value = 10
    const accepted = [0, 5, 15]
    const msg = 'fail'

    try {
      oneOf(value, accepted, msg)
    } catch (ex) {
      expect((ex as Error).message).toEqual(msg)
    }
  })
})
