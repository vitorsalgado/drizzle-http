import { Writable } from 'stream'

export const DISCARD_WRITABLE = new Writable({
  write(_chunk, _encoding, callback) {
    callback()
  }
})
