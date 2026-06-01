import { Link } from './Link.js'

export interface ApiResult<T> {
  data: T
  links: Link[]
}
