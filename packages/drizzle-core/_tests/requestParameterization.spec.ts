import { isHeadersEmpty } from '../headers.js'
import { RequestParameterization } from '../RequestParameterization.js'

describe('RequestValues', function () {
  it('should init with default values', function () {
    const rv = new RequestParameterization(['test'])

    expect(rv.argv).toEqual(['test'])
    expect(rv.path).toEqual('')
    expect(isHeadersEmpty(rv.headers)).toBe(true)
    expect(rv.signal).toBeNull()
    expect(rv.query).toEqual([])
    expect(rv.formFields).toEqual(new URLSearchParams())
    expect(rv.body).toBeNull()
  })
})
