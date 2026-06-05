import { Writable } from 'stream'
import { bench } from 'mitata'

export function createDiscardWritable(): Writable {
  return new Writable({
    write(_chunk, _encoding, callback) {
      callback()
    }
  })
}

export function concurrentBench(name: string, concurrency: number, fn: () => Promise<unknown>): void {
  bench(name, function* () {
    yield {
      concurrency,
      async bench() {
        await fn()
      }
    }
  })
}
