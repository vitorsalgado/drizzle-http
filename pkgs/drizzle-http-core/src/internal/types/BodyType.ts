import { Readable } from 'stream'

export type BodyType = Readable | Buffer | Uint8Array | string | null
