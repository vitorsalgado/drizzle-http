import { noop } from '../noop'

describe('Noop', function () {
  it('should do nothing when calling noop() function', function () {
    expect(() => noop()).not.toThrowError()
    expect(() => noop(1, 'test', false)).not.toThrowError()
    expect(noop()).toBeUndefined()
    expect(noop(1, 'test', false)).toBeUndefined()
  })
})
