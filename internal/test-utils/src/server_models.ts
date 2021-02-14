import { IncomingHttpHeaders } from 'http'

export class TestResult<T> {
  url!: string
  method!: string
  query!: any
  headers!: IncomingHttpHeaders
  params!: any
  body: any
  result!: T
}

export interface Ok {ok: boolean}

export interface TestId {id: string}

export interface Data {
  description: string,
  active: boolean
}
