import { RequestParameterization } from '../RequestParameterization'
import { HttpHeaders } from '../HttpHeaders'

describe('RequestValues', function () {
  it('should init with default values', function () {
    const rv = new RequestParameterization(['test'])

    expect(rv.argv).toEqual(['test'])
    expect(rv.path).toEqual('')
    expect(rv.headers).toEqual(new HttpHeaders({}))
    expect(rv.signal).toBeNull()
    expect(rv.query).toEqual([])
    expect(rv.formFields).toEqual(new URLSearchParams())
    expect(rv.body).toBeNull()
  })
})
