import { Readable } from 'stream'
import { HttpBody } from './http.body'

describe('Body', () => {
  function* txt() {
    yield 'start'
    yield '-'
    yield 'end'
  }

  describe('ensure empty initialization', () => {
    it('with no value', async () => {
      const body = new HttpBody()

      expect(body.body).toBeNull()
      expect(body.bodyUsed).toBeFalsy()
      expect(await body.text()).toEqual('')
      expect(body.bodyUsed).toBeTruthy()
    })

    it('with NULL', async () => {
      const body = new HttpBody(null)

      expect(body.body).toBeNull()
      expect(body.bodyUsed).toBeFalsy()
      expect(await body.text()).toEqual('')
      expect(body.bodyUsed).toBeTruthy()
    })

    it('with undefined', async () => {
      const body = new HttpBody(undefined)

      expect(body.body).toBeNull()
      expect(body.bodyUsed).toBeFalsy()
      expect(await body.json()).toBeNull()
      expect(body.bodyUsed).toBeTruthy()
    })

    it('with Readable', async () => {
      const body = new HttpBody(new Readable())

      expect(body.body).toBeInstanceOf(Readable)
      expect(body.bodyUsed).toBeFalsy()
    })

    it('with Buffer', async () => {
      const body = new HttpBody(Buffer.allocUnsafe(0))

      expect(body.body).toBeInstanceOf(Buffer)
      expect(body.bodyUsed).toBeFalsy()
      expect(await body.text()).toEqual('')
      expect(body.bodyUsed).toBeTruthy()
    })

    it('with numbers', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const body = new HttpBody(50)

      expect(body.body).toBeInstanceOf(Buffer)
      expect(body.bodyUsed).toBeFalsy()
      expect(await body.text()).toEqual('50')
      expect(body.bodyUsed).toBeTruthy()
    })
  })

  it('should return text when calling .text()', async () => {
    const body = new HttpBody(Readable.from(txt(), { objectMode: false }))

    expect(body.body).toBeInstanceOf(Readable)
    expect(body.bodyUsed).toBeFalsy()

    const res = await body.text()

    expect(typeof res).toEqual('string')
    expect(res).toEqual('start-end')
    expect(body.bodyUsed).toBeTruthy()
  })

  it('should init with body as string', async () => {
    const body = new HttpBody('start-end')

    expect(body.body).toBeInstanceOf(Buffer)
    expect(body.bodyUsed).toBeFalsy()

    const res = await body.text()

    expect(typeof res).toEqual('string')
    expect(res).toEqual('start-end')
    expect(body.bodyUsed).toBeTruthy()
  })

  it('should return object when calling .json()', async () => {
    interface Result {
      name: string
    }

    const obj = { name: 'cool name' } as Result
    const body = new HttpBody(Readable.from(JSON.stringify(obj)))

    expect(body.body).toBeInstanceOf(Readable)
    expect(body.bodyUsed).toBeFalsy()

    const res: Result = await body.json()

    expect(typeof res).toEqual('object')
    expect(res).toStrictEqual(obj)
    expect(body.bodyUsed).toBeTruthy()
  })

  it('should return arrayBuffer when calling .arrayBuffer()', async () => {
    interface Result {
      name: string
    }

    const obj = { name: 'cool name' } as Result
    const body = new HttpBody(Readable.from(JSON.stringify(obj)))

    expect(body.body).toBeInstanceOf(Readable)
    expect(body.bodyUsed).toBeFalsy()

    const ab = await body.arrayBuffer()
    const res: Result = JSON.parse(Buffer.from(ab).toString())

    expect(typeof res).toEqual('object')
    expect(res).toStrictEqual(obj)
    expect(body.bodyUsed).toBeTruthy()
  })

  it('should throw error when calling .formData() as this is not supported yet', async () => {
    const body = new HttpBody(Readable.from(txt(), { objectMode: false }))

    expect(() => body.formData()).toThrow()
  })

  it('should throw error when calling .blob() as this is not supported yet', async () => {
    const body = new HttpBody(Readable.from(txt(), { objectMode: false }))

    expect(() => body.blob()).toThrow()
  })
})
