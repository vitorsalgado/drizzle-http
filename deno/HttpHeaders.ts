export const HttpHeaders = {
  CONTENT_TYPE: "content-type",
  ACCEPT: "accept",
};

export function headerToObj(headers: Headers): Record<string, string> {
  return Array.from(headers.entries()).reduce(
    (obj, [key, value]) => Object.assign(obj, { [key]: value }),
    {},
  );
}

export function mergeHeaders(headers: Headers, other: Headers) {
  for (const [name, value] of headers) {
    if (!other.has(name)) {
      other.set(name, value);
    }
  }
}

export function mergeHeaderWithObject(
  headers: Headers,
  obj: Record<string, string>,
) {
  for (const [k, v] of Object.entries(obj)) {
    if (!headers.has(k)) {
      headers.set(k, v);
    }
  }
}
