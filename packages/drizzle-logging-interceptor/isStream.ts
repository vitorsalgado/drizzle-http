/* eslint-disable @typescript-eslint/no-explicit-any */

export function isStream(body: any): boolean {
  return (
    (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream) ||
    typeof body[Symbol.asyncIterator] === 'function'
  )
}
