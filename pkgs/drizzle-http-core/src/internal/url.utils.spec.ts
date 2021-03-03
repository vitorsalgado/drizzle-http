import {
  encodeFormFieldIfNecessary,
  encodeIfNecessary,
  fixedEncodeURIComponent,
  isAbsolute,
  isEncoded
} from './url.utils'

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

  it('should return the same value when form field value is already encoded', function () {
    const val = 'name%2Bage%2Baddress'

    expect(encodeFormFieldIfNecessary(val)).toEqual(val)
  })

  it('should return the same value when value is already encoded', function () {
    const val = 'name%2Bage%2Baddress'

    expect(encodeIfNecessary(val)).toEqual(val)
  })
})
