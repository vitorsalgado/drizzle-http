import { ResultadoApi } from './ResultadoApi'
import { ApiResult } from './ApiResult'

export const mapList =
  <R, TR>(mapper: (response: R) => TR) =>
  (response: ResultadoApi<R[]>): ApiResult<TR[]> => ({
    links: response.links,
    data: response.dados.map(mapper)
  })
