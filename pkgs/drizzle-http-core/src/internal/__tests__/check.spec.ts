import { Check } from '../check'
import { DrizzleError } from '../errors'

describe('Check', () => {
  describe('emptyStr', function () {
    it('should throw error when string is empty', () => {
      const msg = 'test'

      try {
        Check.emptyStr('', msg)
      } catch (e) {
        const error = e as DrizzleError

        expect(error).toBeInstanceOf(DrizzleError)
        expect(error.message).toContain(msg)
        return
      }

      throw new Error('should not reach here')
    })

    it('should do nothing when string is not empty', () => {
      Check.emptyStr('test', 'msg')
    })
  })

  describe('nullOrUndefined', function () {
    it('should throw error when value is null or undefined', () => {
      const msg = 'test'

      try {
        Check.nullOrUndefined(null, msg)
      } catch (e) {
        const error = e as DrizzleError

        expect(error).toBeInstanceOf(DrizzleError)
        expect(error.message).toContain(msg)
        return
      }

      try {
        Check.nullOrUndefined(undefined, msg)
      } catch (e) {
        const error = e as DrizzleError

        expect(error).toBeInstanceOf(DrizzleError)
        expect(error.message).toContain(msg)
        return
      }

      throw new Error('should not reach here')
    })

    it('should do nothing when value is not null or undefined', () => {
      Check.nullOrUndefined('test', 'msg')
      Check.nullOrUndefined(10, 'msg')
      Check.nullOrUndefined(true, 'msg')
      Check.nullOrUndefined([], 'msg')
      Check.nullOrUndefined({}, 'msg')
      Check.nullOrUndefined(/test/g, 'msg')
    })
  })
})
