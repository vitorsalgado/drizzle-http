import { createFetchDecorator } from '../setupRequestInit.ts'

export function Credentials(credentials: RequestCredentials) {
  return createFetchDecorator(Credentials, requestInit => (requestInit.credentials = credentials))
}
