import stream from 'stream'

export type BodyType = stream.Readable | ReadableStream<Uint8Array> | Buffer | Uint8Array | string | null
