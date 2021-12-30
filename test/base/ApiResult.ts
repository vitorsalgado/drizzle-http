import { Link } from './Link'

export interface ApiResult<T> {
  data: T
  links: Link[]
}
