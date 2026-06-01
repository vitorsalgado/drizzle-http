import { Link } from './Link.js'

export interface ResultadoApi<T> {
  dados: T
  links: Link[]
}
