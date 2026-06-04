import { ContentType, DrizzleBuilder, FormUrlEncoded, GET, Params } from '@drizzle-http/core'
import { noop } from '@drizzle-http/core'
import { MediaTypes } from '@drizzle-http/core'
import { POST } from '@drizzle-http/core'
import { Body } from '@drizzle-http/core'
import { RawResponse } from '@drizzle-http/core'
import { Multipart } from '@drizzle-http/core'
import { Part } from '@drizzle-http/core'
import { UseJsonConv } from '@drizzle-http/core'
import { BodyKey } from '@drizzle-http/core'
import { CORS } from '../decorators/index.js'
import { Mode } from '../decorators/index.js'
import { ReferrerPolicy } from '../decorators/index.js'
import { Referrer } from '../decorators/index.js'
import { Redirect } from '../decorators/index.js'
import { Cache } from '../decorators/index.js'
import { KeepAlive } from '../decorators/index.js'
import { FetchCallFactory } from '../FetchCallFactory.js'
import { PartParameterHandlerFactory } from '../MultipartParameterHandler.js'
import { MultipartRequestBodyConverterFactory } from '../MultipartRequestBodyConverter.js'

@CORS()
@KeepAlive(true)
@UseJsonConv()
class ApiTs {
  @GET('/txt')
  @ContentType(MediaTypes.TEXT_PLAIN)
  @RawResponse()
  txt(): Promise<Response> {
    return noop()
  }

  @POST('/parts')
  @Multipart()
  @RawResponse()
  @Params([Part('part1'), Part('part2', 'part2-filename'), Part('part3')])
  parts(part1: unknown, part2: unknown, part3: string): Promise<Response> {
    return noop(part1, part2, part3)
  }

  @POST('/parts')
  @Multipart()
  @RawResponse()
  @Params([Body(), BodyKey('data')])
  file(file: File): Promise<Response> {
    return noop(file)
  }

  @POST('/parts')
  @Multipart()
  @RawResponse()
  @Params([Body()])
  files(files: Array<File>): Promise<Response> {
    return noop(files)
  }

  @POST('/parts')
  @Multipart()
  @RawResponse()
  @Params([Body()])
  form(form: HTMLFormElement): Promise<Response> {
    return noop(form)
  }

  @POST('/parts')
  @Multipart()
  @RawResponse()
  @Params([Body()])
  fromDOM(input: HTMLInputElement): Promise<Response> {
    return noop(input)
  }

  @POST('/form')
  @FormUrlEncoded()
  @Params([Body()])
  formUrlEncoded(form: Record<string, string>): Promise<Response> {
    return noop(form)
  }

  @POST('/json')
  @ContentType(MediaTypes.APPLICATION_JSON)
  @Mode('cors')
  @ReferrerPolicy('no-referrer')
  @Referrer('ref')
  @Redirect('manual')
  @Cache('no-cache')
  @UseJsonConv()
  @Params([Body()])
  json(data: unknown): Promise<{ status: string; data: { test: string } }> {
    return noop(data)
  }
}

const tsApi = DrizzleBuilder.newBuilder()
  .baseUrl('http://localhost:3001/')
  .callFactory(FetchCallFactory.DEFAULT)
  .addParameterHandlerFactory(new PartParameterHandlerFactory())
  .addRequestConverterFactories(new MultipartRequestBodyConverterFactory())
  .build()
  .create(ApiTs)

document.addEventListener('DOMContentLoaded', () => {
  tsApi
    .txt()
    .then(response => response.text())
    .then(txt => {
      ;(document.getElementById('txt') as HTMLDivElement).textContent = txt
    })

  tsApi.json({ test: 'json' }).then(response => {
    ;(document.getElementById('json') as HTMLDivElement).textContent = JSON.stringify(response)
  })

  document.getElementById?.('btnParts')?.addEventListener('click', ev => {
    ev.preventDefault()

    const part1 = (document.getElementById('part1') as HTMLInputElement).files?.item(0)
    const part2 = (document.getElementById('part2') as HTMLInputElement).files?.item(0)
    const part3 = (document.getElementById('part3') as HTMLInputElement).value

    tsApi
      .parts(part1, part2, part3)
      .then(response => response.text())
      .then(response => ((document.getElementById('partsResult') as HTMLParagraphElement).textContent = response))
  })

  document.getElementById?.('frmBtn')?.addEventListener('click', ev => {
    ev.preventDefault()

    const form = document.getElementById('frm') as HTMLFormElement

    tsApi
      .form(form)
      .then(response => response.text())
      .then(response => ((document.getElementById('formResult') as HTMLParagraphElement).textContent = response))
  })

  document.getElementById?.('btnSingleFile')?.addEventListener('click', ev => {
    ev.preventDefault()

    const file = document.getElementById('singleFile') as HTMLInputElement

    tsApi
      .file(file.files?.item(0) as File)
      .then(response => response.text())
      .then(response => ((document.getElementById('singleFileResult') as HTMLParagraphElement).textContent = response))
  })

  document.getElementById?.('btnMultipleFiles')?.addEventListener('click', ev => {
    ev.preventDefault()

    const files = document.getElementById('multipleFiles') as HTMLInputElement

    tsApi
      .files([...(files.files as FileList)])
      .then(response => response.text())
      .then(
        response => ((document.getElementById('multipleFilesResult') as HTMLParagraphElement).textContent = response)
      )
  })

  document.getElementById?.('btnFilesDOM')?.addEventListener('click', ev => {
    ev.preventDefault()

    const files = document.getElementById('filesDOM') as HTMLInputElement

    tsApi
      .fromDOM(files)
      .then(response => response.text())
      .then(response => ((document.getElementById('filesDOMResult') as HTMLParagraphElement).textContent = response))
  })

  document.getElementById?.('sendFormUrlEncoded')?.addEventListener('click', ev => {
    ev.preventDefault()

    tsApi
      .formUrlEncoded({ doc1: 'one', doc2: 'two' })
      .then(response => response.text())
      .then(txt => console.log(txt))
  })
})
