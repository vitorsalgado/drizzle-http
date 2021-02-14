import { BodyType } from './types'
import { MethodNotSupportedError, PrematureServerResponseCloseError } from './internal'
import { Stream } from 'stream'

const sBody = Symbol('body')
const sBodyUsed = Symbol('bodyUsed')

export class HttpBody {
  [sBody]: BodyType
  [sBodyUsed]: boolean

  constructor(input: BodyType = null) {
    if (input === null) {
      this[sBody] = null
    } else if (typeof input === 'string') {
      this[sBody] = Buffer.from(input)
    } else if (Buffer.isBuffer(input) || input instanceof Stream) {
      this[sBody] = input
    } else {
      this[sBody] = Buffer.from(String(input))
    }

    this[sBodyUsed] = false
  }

  get body(): BodyType {
    return this[sBody]
  }

  get bodyUsed(): boolean {
    return this[sBodyUsed]
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const { buffer, byteOffset, byteLength } = await this.consumeBody(this[sBody])
    return buffer.slice(byteOffset, byteOffset + byteLength)
  }

  json<T>(): Promise<T> {
    return this.text()
      .then(txt => {
        if (txt.length === 0) {
          return null
        }

        return JSON.parse(txt)
      })
      .finally(() => (this[sBodyUsed] = true))
  }

  text(): Promise<string> {
    return this.consumeBody(this[sBody], true).then(buf => buf.toString())
  }

  // region Not Supported

  /**
   * @virtual
   */
  blob(): Promise<unknown> {
    throw new MethodNotSupportedError('blob()')
  }

  /**
   * @virtual
   */
  formData(): Promise<unknown> {
    throw new MethodNotSupportedError('formData()')
  }

  // endregion

  private async consumeBody(body: BodyType, encode = false): Promise<Buffer> {
    this[sBodyUsed] = true

    if (body === null) {
      return Buffer.alloc(0)
    }

    if (Buffer.isBuffer(body)) {
      return body
    }

    if (!(body instanceof Stream.Readable)) {
      return Buffer.alloc(0)
    }

    if (encode) {
      body.setEncoding('utf-8')
    }

    const data: any[] = []
    let acc = 0

    for await (const chunk of body) {
      acc += chunk.length
      data.push(chunk)
    }

    if (body.readableEnded) {
      if (encode || data.every(d => typeof d === 'string')) {
        return Buffer.from(data.join(''), 'utf-8')
      }

      return Buffer.concat(data, acc)
    }

    throw new PrematureServerResponseCloseError()
  }
}
