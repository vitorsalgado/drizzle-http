import stream from 'stream'

export type BodyType = stream.Readable | Buffer | Uint8Array | string | null
