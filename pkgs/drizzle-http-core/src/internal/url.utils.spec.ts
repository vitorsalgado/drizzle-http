import { fixedEncodeURIComponent, isAbsolute, isEncoded } from './url.utils'

describe('URL Utils', () => {
  it('should detect when value is encoded and not encoded', () => {
    const unencoded = 'unencoded-string_with-underline'
    const encoded = 'test with space __ $(encoded 100)##'
    const encodedExpected = 'test%20with%20space%20__%20%24%28encoded%20100%29%23%23'

    expect(isEncoded(unencoded)).toBeFalsy()
    expect(isEncoded(encoded)).toBeFalsy()

    expect(encodedExpected).toEqual(fixedEncodeURIComponent(encoded))
    expect(unencoded).toEqual(fixedEncodeURIComponent(unencoded))
  })

  it('should validate if url is absolute or not', () => {
    expect(isAbsolute('http://www.test.com.br')).toBeTruthy()
    expect(isAbsolute('/test/ok')).toBeFalsy()
  })
})
