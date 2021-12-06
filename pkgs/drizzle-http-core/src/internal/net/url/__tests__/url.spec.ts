import { isAbsolute } from '..'

describe('URL Utils', () => {
  it('should validate if url is absolute or not', () => {
    expect(isAbsolute('http://www.test.com.br')).toBeTruthy()
    expect(isAbsolute('/test/ok')).toBeFalsy()
  })
})
