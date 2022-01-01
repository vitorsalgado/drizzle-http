export function isAbsolute(u: string) {
  return u.indexOf("http://") === 0 || u.indexOf("https://") === 0;
}
