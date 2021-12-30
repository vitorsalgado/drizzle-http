import { RequestFactory } from '../RequestFactory.ts'
import { RequestParameterization } from '../RequestParameterization.ts'
import { RequestBodyConverterFactory } from '../RequestBodyConverter.ts'
import { RequestBodyConverter } from '../RequestBodyConverter.ts'
import { Drizzle } from '../Drizzle.ts'
import { BuiltInConv } from '../builtin/index.ts'
import { BodyKey } from '../index.ts'

class IllegalMultipartBodyError extends Internals.DrizzleError {
  constructor(value: unknown) {
    super(
      `Body with type "${typeof value}" is not allowed for a Multipart request.` +
        'Body must be: HTMLFormElement, HTMLInputElement, FormData, File or File[]',
      'DZ_ERR_INVALID_MULTIPART_BODY'
    )
  }
}

class MultipartRequestBodyConverter implements RequestBodyConverter<unknown> {
  static INSTANCE: MultipartRequestBodyConverter = new MultipartRequestBodyConverter()

  constructor(private readonly name?: string) {}

  convert(requestFactory: RequestFactory, requestParameterization: RequestParameterization, value: unknown): void {
    if (value instanceof HTMLFormElement) {
      requestParameterization.body = new FormData(value)
    } else if (value instanceof FormData) {
      requestParameterization.body = value
    } else if (value instanceof File) {
      const formData = new FormData()
      const nm = this.name || 'file'

      formData.append(nm, value)

      requestParameterization.body = formData
    } else if (Array.isArray(value) && value.length > 0) {
      if (!(value[0] instanceof File)) {
        throw new IllegalMultipartBodyError(value[0])
      }

      const formData = new FormData()
      const nm = this.name || 'files'

      for (const file of value as Array<File>) {
        formData.append(nm, file)
      }

      requestParameterization.body = formData
    } else if (value instanceof HTMLInputElement) {
      const formData = new FormData()
      const nm = this.name || 'files'

      for (const file of value.files as FileList) {
        formData.append(value.name || nm, file)
      }

      requestParameterization.body = formData
    } else {
      throw new IllegalMultipartBodyError(value)
    }
  }
}

export class MultipartRequestBodyConverterFactory implements RequestBodyConverterFactory {
  provide(drizzle: Drizzle, requestType: string, requestFactory: RequestFactory): RequestBodyConverter<unknown> | null {
    if (requestType === BuiltInConv.MULTIPART) {
      if (requestFactory.hasDecorator(BodyKey)) {
        return new MultipartRequestBodyConverter(requestFactory.getConfig(BodyKey.KEY))
      }

      return MultipartRequestBodyConverter.INSTANCE
    }

    return null
  }
}
