import { createFetchDecorator } from '../setupRequestInit'

export function Credentials(credentials: RequestCredentials) {
  return createFetchDecorator(Credentials, requestInit => (requestInit.credentials = credentials))
}
