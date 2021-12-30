import { Link } from './Link'

export interface ResultadoApi<T> {
  dados: T
  links: Link[]
}
