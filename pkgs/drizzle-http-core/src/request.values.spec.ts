import { RequestValues } from './request.values'
import { Headers } from './http.headers'

describe('RequestValues', function () {
  it('should init with default values', function () {
    const rv = new RequestValues(['test'])

    expect(rv.argv).toEqual(['test'])
    expect(rv.path).toEqual('')
    expect(rv.headers).toEqual(new Headers({}))
    expect(rv.signal).toBeNull()
    expect(rv.query).toEqual([])
    expect(rv.formFields).toEqual([])
    expect(rv.body).toBeNull()
  })
})
