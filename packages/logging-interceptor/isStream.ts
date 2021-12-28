export function isStream(body: unknown): boolean {
  return typeof ReadableStream !== 'undefined' && body instanceof ReadableStream
}
