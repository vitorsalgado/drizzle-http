import { StreamingCompletion, StreamingResponse } from '../streaming_response.js'

describe('StreamingResponse', function () {
  it('should fail when calling response body parse functions', function () {
    const completed = Promise.resolve({ trailers: new Headers() } satisfies StreamingCompletion)

    const res = new StreamingResponse(
      'http://test',
      {
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'none' }
      },
      completed
    )

    expect(() => res.arrayBuffer()).toThrowError()
    expect(() => res.text()).toThrowError()
    expect(() => res.formData()).toThrowError()
    expect(() => res.blob()).toThrowError()
    expect(() => res.json()).toThrowError()
    expect(res.body).toBeNull()
    expect(res.status).toEqual(200)
    expect(res.ok).toBeTruthy()
    expect(res.bodyUsed).toBeTruthy()
    expect(res.completed).toBe(completed)
  })
})
