import { InvalidArgumentError } from '../InvalidArgumentError'

describe('InvalidArgumentError', function () {
  it('should init with a default message when none is provided', function () {
    const err = new InvalidArgumentError()

    expect(err.message).toBeDefined()
    expect(err.message.length).toBeGreaterThan(0)
  })

  it('should init with provided message', function () {
    const err = new InvalidArgumentError('test msg')

    expect(err.message).toEqual('test msg')
  })
})
