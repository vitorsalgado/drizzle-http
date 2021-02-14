import stream from 'stream'

export type BodyType = stream.Readable | Buffer | Uint8Array | string | null
export type HeadersType = Record<string, string>
export type ReturnType = { new(...args: any[]): any }
